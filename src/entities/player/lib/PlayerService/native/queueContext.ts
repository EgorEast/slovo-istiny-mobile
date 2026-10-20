import AsyncStorage from '@react-native-async-storage/async-storage'
import { type AudioPlaylistLoopMode } from 'expo-audio'
import { type PlaylistData } from 'entities/playlist/@x/player'
import { type AudioPlayerData, toAudioPlayerData } from 'entities/sermon/@x/player'
import { CURRENT_AUDIO, CURRENT_PLAYLIST, CURRENT_REPEAT_MODE } from 'shared/config'
import { ctx } from 'shared/lib/reatom-ctx'
import {
  currentAudioAtom,
  currentPlaylistAtom,
  RepeatMode,
  repeatModeAtom,
  repeatModeSchema,
} from '../../../model'
import { parseAudioPlayerData, parsePlaylistData } from '../../playerStorageParsers'
import { mapRepeatMode } from './mapRepeatMode'
import { resolveQueueSource } from './resolveQueueSource'

export interface QueueContext {
  loop: AudioPlaylistLoopMode
  sources: string[]
  startIndex: number
  tracks: AudioPlayerData[]
}

const collectPlaylistTracks = (playlist: null | PlaylistData | undefined): AudioPlayerData[] =>
  (playlist?.sermons ?? [])
    .map(toAudioPlayerData)
    .filter((track): track is AudioPlayerData => track !== null)

const findStartIndex = (
  tracks: AudioPlayerData[],
  currentAudio: AudioPlayerData | null,
  audioUrl: string,
): number => tracks.findIndex(track => track.id === currentAudio?.id || track.audioUrl === audioUrl)

const buildSingleTrack = (
  tracks: AudioPlayerData[],
  currentAudio: AudioPlayerData | null,
  audioUrl: string,
): AudioPlayerData => {
  if (currentAudio?.audioUrl === audioUrl) return currentAudio

  return (
    tracks.find(track => track.audioUrl === audioUrl) ?? {
      artist: '',
      artwork: null,
      audioUrl,
      id: audioUrl,
      title: '',
    }
  )
}

/**
 * Reconstructs the native queue for a load request: the current playlist when
 * it still contains the requested track, otherwise a one-track queue. Storage
 * wins over atoms so a restore reconciles with what a frozen JS last persisted.
 * @param audioUrl - Network URL of the track being loaded.
 */
export const readQueueContext = async (audioUrl: string): Promise<QueueContext> => {
  const storedMap = Object.fromEntries(
    await AsyncStorage.multiGet([CURRENT_AUDIO, CURRENT_PLAYLIST, CURRENT_REPEAT_MODE]),
  )
  const storedAudio = parseAudioPlayerData(storedMap[CURRENT_AUDIO])
  const storedPlaylist = parsePlaylistData(storedMap[CURRENT_PLAYLIST])
  const { data: storedRepeatMode } = repeatModeSchema.safeParse(storedMap[CURRENT_REPEAT_MODE])
  const currentAudio = storedAudio ?? ctx.get(currentAudioAtom) ?? null
  const playlist = storedPlaylist ?? ctx.get(currentPlaylistAtom) ?? null
  const playlistTracks = collectPlaylistTracks(playlist)
  const foundIndex = findStartIndex(playlistTracks, currentAudio, audioUrl)
  const tracks =
    foundIndex >= 0 ? playlistTracks : [buildSingleTrack(playlistTracks, currentAudio, audioUrl)]
  const sources = await Promise.all(tracks.map(track => resolveQueueSource(track.audioUrl)))

  return {
    loop: mapRepeatMode(storedRepeatMode ?? ctx.get(repeatModeAtom) ?? RepeatMode.Off),
    sources,
    startIndex: foundIndex >= 0 ? foundIndex : 0,
    tracks,
  }
}
