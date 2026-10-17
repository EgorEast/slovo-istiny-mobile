import { resumeWebAfterPause, shouldRebindForResume } from './reconnectHeal'

const AUDIO_URL = 'https://example.com/audio.mp3'

describe('shouldRebindForResume', () => {
  test('matching absolute src does not rebind', () => {
    expect(shouldRebindForResume(AUDIO_URL, AUDIO_URL)).toBe(false)
  })

  test('relative src that resolves to the requested url does not rebind', () => {
    expect(shouldRebindForResume('/audio.mp3', AUDIO_URL)).toBe(false)
    expect(shouldRebindForResume(AUDIO_URL, '/audio.mp3')).toBe(false)
  })

  test('a different track rebinds', () => {
    expect(shouldRebindForResume('https://example.com/other.mp3', AUDIO_URL)).toBe(true)
  })

  test('an empty/missing src rebinds', () => {
    expect(shouldRebindForResume('', AUDIO_URL)).toBe(true)
    expect(shouldRebindForResume(null, AUDIO_URL)).toBe(true)
    expect(shouldRebindForResume(undefined, AUDIO_URL)).toBe(true)
  })
})

describe('resumeWebAfterPause', () => {
  const createPlayer = () => ({
    getState: jest.fn(() => ({ position: 42000 })),
    play: jest.fn().mockResolvedValue(undefined),
    replaceAudio: jest.fn().mockResolvedValue(null),
  })

  test('plays without rebuilding when the element already serves the url', async () => {
    const player = createPlayer()

    await resumeWebAfterPause(player, { src: AUDIO_URL } as HTMLAudioElement, AUDIO_URL)

    expect(player.replaceAudio).not.toHaveBeenCalled()
    expect(player.play).toHaveBeenCalledTimes(1)
  })

  test('rebuilds at the saved position then plays on a source mismatch', async () => {
    const player = createPlayer()

    await resumeWebAfterPause(
      player,
      { src: 'https://example.com/other.mp3' } as HTMLAudioElement,
      AUDIO_URL,
    )

    expect(player.replaceAudio).toHaveBeenCalledWith(AUDIO_URL, 42000)
    expect(player.play).toHaveBeenCalledTimes(1)
  })

  test('rebuilds when no element is loaded', async () => {
    const player = createPlayer()

    await resumeWebAfterPause(player, null, AUDIO_URL)

    expect(player.replaceAudio).toHaveBeenCalledWith(AUDIO_URL, 42000)
    expect(player.play).toHaveBeenCalledTimes(1)
  })
})
