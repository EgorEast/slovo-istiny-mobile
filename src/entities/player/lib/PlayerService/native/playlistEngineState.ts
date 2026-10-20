import { type AudioPlaylist } from 'expo-audio'
import { type AudioPlayerData } from 'entities/sermon/@x/player'
import { type PlaylistSubscriptions } from './playlistEngineListeners'
import { type PlaylistEngineCallbacks, type TrackSnapshot } from './playlistEngineTypes'

export interface PlaylistEngineState {
  audioTracks: AudioPlayerData[]
  callbacks: null | PlaylistEngineCallbacks
  currentSourceUri: null | string
  playlist: AudioPlaylist | null
  snapshots: Map<number, TrackSnapshot>
  sources: string[]
  subscriptions: PlaylistSubscriptions
}

export const createPlaylistEngineState = (): PlaylistEngineState => ({
  audioTracks: [],
  callbacks: null,
  currentSourceUri: null,
  playlist: null,
  snapshots: new Map(),
  sources: [],
  subscriptions: { status: null, track: null },
})
