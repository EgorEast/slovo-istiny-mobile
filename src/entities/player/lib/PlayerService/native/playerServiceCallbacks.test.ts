import { ctx } from 'shared/lib/reatom-ctx'
import { currentAudioAtom } from '../../../model'
import { pauseTypeAtom } from '../../../pauseType'
import { createPlayerServiceCallbacks } from './playerServiceCallbacks'

jest.mock('./AudioLoader', () => ({
  audioLoader: { isPartialSource: jest.fn() },
}))

const AUDIO_URL = 'https://example.com/audio.mp3'

const AUDIO_DATA = {
  artist: 'Author',
  artwork: null,
  audioUrl: AUDIO_URL,
  id: 'sermon-1',
  title: 'Test Sermon',
}

const createActions = () => ({
  pause: jest.fn().mockResolvedValue(undefined),
  play: jest.fn().mockResolvedValue(undefined),
  resumeAfterPause: jest.fn().mockResolvedValue(undefined),
})

describe('createPlayerServiceCallbacks', () => {
  beforeEach(() => {
    currentAudioAtom(ctx, null)
    pauseTypeAtom(ctx, null)
  })

  test('interruption auto-resume goes through the cached-source swap', () => {
    currentAudioAtom(ctx, AUDIO_DATA)
    const actions = createActions()
    const { onAudioInterruption } = createPlayerServiceCallbacks(actions)

    onAudioInterruption(true)
    pauseTypeAtom(ctx, 'auto')
    onAudioInterruption(false)

    expect(actions.resumeAfterPause).toHaveBeenCalledWith(AUDIO_URL)
    expect(actions.play).not.toHaveBeenCalled()
  })

  test('falls back to a bare play when there is no current URL', () => {
    const actions = createActions()
    const { onAudioInterruption } = createPlayerServiceCallbacks(actions)

    onAudioInterruption(true)
    pauseTypeAtom(ctx, 'auto')
    onAudioInterruption(false)

    expect(actions.play).toHaveBeenCalled()
    expect(actions.resumeAfterPause).not.toHaveBeenCalled()
  })
})
