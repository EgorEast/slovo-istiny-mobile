import AsyncStorage from '@react-native-async-storage/async-storage'
import { CURRENT_AUDIO } from 'shared/config'
import { ctx } from 'shared/lib/reatom-ctx'
import { currentAudioAtom } from '../../../model'
import { parseAudioPlayerData } from '../../playerStorageParsers'
import { playlistEngine } from './PlaylistEngine'

const queueTracks = () =>
  Array.from({ length: playlistEngine.getTrackCount() }, (_, index) =>
    playlistEngine.getTrackAt(index),
  )

/**
 * Finds the current queue index for a requested track. The current audio atom
 * (or its persisted copy) identifies the sermon a manual switch already
 * committed; the URL is the fallback identity.
 * @param audioUrl - Network URL requested by the caller.
 * @returns Queue index or -1 when the track is not in the current queue.
 */
export const findQueueIndex = async (audioUrl: string): Promise<number> => {
  const storedAudio = parseAudioPlayerData(await AsyncStorage.getItem(CURRENT_AUDIO))
  const audio = ctx.get(currentAudioAtom) ?? storedAudio

  return queueTracks().findIndex(
    track => track !== null && (track.id === audio?.id || track.audioUrl === audioUrl),
  )
}
