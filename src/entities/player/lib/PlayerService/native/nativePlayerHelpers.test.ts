import { ctx } from 'shared/lib/reatom-ctx'
import { isOnlineAtom } from 'shared/model/network'
import { isBufferingAtom } from '../../../model'
import { pauseTypeAtom } from '../../../pauseType'
import { isStalledOfflineAtom } from '../../stalledOffline'
import { createAudioInterruptionHandler } from './nativePlayerHelpers'

const flushMicrotasks = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

describe('createAudioInterruptionHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pauseTypeAtom(ctx, null)
  })

  test('pauses with auto type on the interruption edge', () => {
    const pause = jest.fn().mockResolvedValue(undefined)
    const play = jest.fn().mockResolvedValue(undefined)
    const handler = createAudioInterruptionHandler({ pause, play })

    handler(true)

    expect(pause).toHaveBeenCalledWith('auto')
    expect(play).not.toHaveBeenCalled()
  })

  test('resumes on interruption end when pauseType is auto and stored flag set', () => {
    const pause = jest.fn().mockResolvedValue(undefined)
    const play = jest.fn().mockResolvedValue(undefined)
    const handler = createAudioInterruptionHandler({ pause, play })

    handler(true)
    pauseTypeAtom(ctx, 'auto')
    handler(false)

    expect(play).toHaveBeenCalled()
  })
})

describe('createAudioInterruptionHandler offline stall flag (Issue #109)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pauseTypeAtom(ctx, null)
    isBufferingAtom(ctx, false)
    isOnlineAtom(ctx, true)
    isStalledOfflineAtom(ctx, false)
  })

  test('sets the flag when buffering', async () => {
    isBufferingAtom(ctx, true)
    isOnlineAtom(ctx, false)
    const handler = createAudioInterruptionHandler({ pause: jest.fn(), play: jest.fn() })

    handler(true)
    await flushMicrotasks()

    expect(ctx.get(isStalledOfflineAtom)).toBe(true)
  })

  test('does not set the flag on a manual pause (not buffering)', async () => {
    isOnlineAtom(ctx, false)
    const handler = createAudioInterruptionHandler({ pause: jest.fn(), play: jest.fn() })

    handler(true)
    await flushMicrotasks()

    expect(ctx.get(isStalledOfflineAtom)).toBe(false)
  })

  test('sets the flag when buffering while online (NetInfo lags the underrun)', async () => {
    isBufferingAtom(ctx, true)
    const handler = createAudioInterruptionHandler({ pause: jest.fn(), play: jest.fn() })

    handler(true)
    await flushMicrotasks()

    expect(ctx.get(isStalledOfflineAtom)).toBe(true)
  })
})
