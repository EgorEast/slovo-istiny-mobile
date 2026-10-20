import { type AudioPlaylistStatus } from 'expo-audio'
import { ctx } from 'shared/lib/reatom-ctx'
import {
  applyVolumeAction,
  isSeekingAtom,
  seekTargetPositionAtom,
  setDurationAction,
  setIsBufferingAction,
  setIsPlayingAction,
  setIsSeekingAction,
  setPositionAction,
  setSeekTargetAction,
  volumeAtom,
} from '../../../model'
import { playlistEngine } from './PlaylistEngine'

/** Native position must land this close to the seek target before the guard lifts. */
const SEEK_TARGET_CONFIRM_TOLERANCE_MS = 500
const VOLUME_EPSILON = 0.001

const syncPosition = (positionMs: number): void => {
  if (!ctx.get(isSeekingAtom)) {
    void setPositionAction(ctx, positionMs)
    return
  }
  const target = ctx.get(seekTargetPositionAtom)
  if (target !== null && Math.abs(positionMs - target) < SEEK_TARGET_CONFIRM_TOLERANCE_MS) {
    void setIsSeekingAction(ctx, false)
    void setSeekTargetAction(ctx, null)
  }
}

/**
 * Mirrors a native playlist status into the player atoms. Position keeps the
 * seek-confirmation tolerance; duration is suppressed while a partial source
 * (only ever swapped in by the offline seek path) is playing.
 * @param status - Native playlist status event.
 */
export const syncPlaylistStatus = (status: AudioPlaylistStatus): void => {
  syncPosition(Math.floor(status.currentTime * 1000))
  if (!playlistEngine.isCurrentSourcePartial())
    void setDurationAction(ctx, Math.floor(status.duration * 1000))
  void setIsPlayingAction(ctx, status.playing)
  void setIsBufferingAction(ctx, status.isBuffering)
  if (Math.abs(ctx.get(volumeAtom) - status.volume) > VOLUME_EPSILON)
    applyVolumeAction(ctx, status.volume)
}
