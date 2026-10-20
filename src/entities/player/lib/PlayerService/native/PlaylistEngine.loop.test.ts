import { type AudioPlaylistLoopMode } from 'expo-audio'
import { type AudioPlayerData } from 'entities/sermon/@x/player'
import { playlistEngine } from './PlaylistEngine'

const SOURCE = 'https://example.com/audio.mp3'
const TRACK: AudioPlayerData = {
  artist: 'Author',
  artwork: 'https://example.com/art.jpg',
  audioUrl: SOURCE,
  id: 'sermon-1',
  title: 'Sermon 1',
}

const mockCreateAudioPlaylist = jest.fn()

jest.mock('expo-audio', () => ({
  createAudioPlaylist: (...args: unknown[]) => mockCreateAudioPlaylist(...args),
}))

jest.mock('entities/offline-cache/@x/player', () => ({ PART_SUFFIX: '.cache.mp3' }))

jest.mock('shared/model/error-dialog', () => ({ reportError: jest.fn() }))

jest.mock('./LockScreenControls', () => ({
  lockScreenControls: { clear: jest.fn() },
}))

jest.mock('./awaitPlaylistLoaded', () => ({
  awaitPlaylistLoaded: jest.fn().mockResolvedValue(true),
}))

jest.mock('./playlistEngineListeners', () => ({
  attachPlaylistListeners: jest.fn(() => ({ status: null, track: null })),
}))

jest.mock('./partialDuration', () => ({ applyPartialDuration: jest.fn() }))

// The native `loop` getter touches ExoPlayer from the JS thread and crashes in
// production; any read here is exactly what these tests forbid.
const createPlaylistStub = () => {
  let loopValue: AudioPlaylistLoopMode = 'none'
  const loopGetter = jest.fn(() => loopValue)
  const assignedLoops: AudioPlaylistLoopMode[] = []

  const playlist = {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    currentIndex: 0,
    currentTime: 0,
    destroy: jest.fn(),
    duration: 120,
    isLoaded: true,
    get loop() {
      return loopGetter()
    },
    set loop(value: AudioPlaylistLoopMode) {
      assignedLoops.push(value)
      loopValue = value
    },
    seekTo: jest.fn().mockResolvedValue(undefined),
    skipTo: jest.fn(),
  }

  return { assignedLoops, loopGetter, playlist }
}

const buildPlaylist = async (loop: AudioPlaylistLoopMode) => {
  const stub = createPlaylistStub()
  mockCreateAudioPlaylist.mockReturnValue(stub.playlist)
  await playlistEngine.buildQueue([TRACK], [SOURCE], 0, loop)
  return stub
}

describe('PlaylistEngine loop state', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    playlistEngine.setCallbacks({ onStatus: jest.fn(), onTrackChanged: jest.fn() })
  })

  test('buildQueue records the loop mode and getLoop never reads the native getter', async () => {
    const { loopGetter, playlist } = await buildPlaylist('all')

    expect(playlistEngine.getPlaylist()).toBe(playlist)
    expect(playlistEngine.getLoop()).toBe('all')
    expect(loopGetter).not.toHaveBeenCalled()
  })

  test('setLoopMode writes natively, mirrors into state, and getLoop stays native-read free', async () => {
    const { assignedLoops, loopGetter } = await buildPlaylist('none')

    playlistEngine.setLoopMode('single')

    expect(assignedLoops).toEqual(['single'])
    expect(playlistEngine.getLoop()).toBe('single')
    expect(loopGetter).not.toHaveBeenCalled()
  })
})
