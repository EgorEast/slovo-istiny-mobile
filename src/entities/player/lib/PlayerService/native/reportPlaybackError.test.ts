import { ctx } from 'shared/lib/reatom-ctx'
import { reportError } from 'shared/model/error-dialog'
import { isOnlineAtom } from 'shared/model/network'
import { isStalledOfflineAtom } from '../../stalledOffline'
import { reportPlaybackError } from './reportPlaybackError'

jest.mock('shared/model/error-dialog', () => ({ reportError: jest.fn() }))

const flushMicrotasks = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

describe('reportPlaybackError', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    isOnlineAtom(ctx, true)
    isStalledOfflineAtom(ctx, false)
  })

  test('online: reports the error without flagging an offline stall', async () => {
    reportPlaybackError('decoder failed')
    await flushMicrotasks()

    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: '[player] playback error: decoder failed' }),
    )
    expect(ctx.get(isStalledOfflineAtom)).toBe(false)
  })

  test('offline: also sets the stalled-offline flag for the reconnect heal', async () => {
    isOnlineAtom(ctx, false)

    reportPlaybackError('network failed')
    await flushMicrotasks()

    expect(reportError).toHaveBeenCalledTimes(1)
    expect(ctx.get(isStalledOfflineAtom)).toBe(true)
  })
})
