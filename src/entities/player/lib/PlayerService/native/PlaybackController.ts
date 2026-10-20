import { ctx } from 'shared/lib/reatom-ctx'
import { reportError } from 'shared/model/error-dialog'
import {
  setIsPlayingAction,
  setIsSeekingAction,
  setPositionAction,
  setSeekTargetAction,
} from '../../../model'
import { type PlaybackRate } from '../../../playback-rate'
import { flushProgress, scheduleHistoryFlush } from '../progressFlusher'
import { type PlaybackStatus, type SeekSourceSwap } from '../types'
import { audioEffectsAttach } from './audioEffectsAttach'
import { audioEffectsPreferences } from './audioEffectsPreferences'
import { type PlayableAudio } from './playableAudio'
import { playbackPreferences } from './playbackPreferences'
import { resolvePlaybackStatus } from './playbackStatus'
import { seekGuard } from './SeekGuard'
import { seekWithSourceSwap } from './seekViaPartialSource'

/**
 * PlaybackController handles core playback operations.
 * Works with an external player instance passed as parameter.
 */
class PlaybackController {
  public play = async (player: null | PlayableAudio): Promise<void> => {
    if (!player?.isLoaded) return

    player.play()
  }

  public pause = async (player: null | PlayableAudio): Promise<void> => {
    if (!player?.isLoaded) return

    const positionMs = Math.floor(player.currentTime * 1000)
    player.pause()
    void setIsPlayingAction(ctx, false)
    flushProgress(positionMs)
  }

  public stop = async (player: null | PlayableAudio): Promise<void> => {
    if (!player?.isLoaded) return

    const positionMs = Math.floor(player.currentTime * 1000)
    player.pause()
    try {
      await player.seekTo(0)
    } catch (error) {
      console.error('[PlaybackController] stop seekTo(0) failed:', error)
      reportError(error, 'Ошибка при сбросе позиции')
    }
    void setIsPlayingAction(ctx, false)
    flushProgress(positionMs)
  }

  public seekTo = async (
    player: null | PlayableAudio,
    positionMs: number,
    sourceSwap?: SeekSourceSwap,
  ): Promise<void> => {
    if (!player) return
    const clampedPosition = Math.max(0, positionMs)
    if (sourceSwap) {
      const swapped = await seekWithSourceSwap(sourceSwap, clampedPosition)
      if (swapped) return
    }
    seekGuard.arm()

    void setIsSeekingAction(ctx, true)
    void setSeekTargetAction(ctx, clampedPosition)
    void setPositionAction(ctx, clampedPosition)
    scheduleHistoryFlush(clampedPosition)
    try {
      await player.seekTo(clampedPosition / 1000)
    } catch (error) {
      console.error('[PlaybackController] seekTo failed:', error)
      reportError(error, 'Ошибка при перемотке аудио')
      seekGuard.clear()
      void setIsSeekingAction(ctx, false)
    }
  }

  public resetSeekGuard = (): void => {
    seekGuard.reset()
  }

  public setPlaybackRate = async (
    player: null | PlayableAudio,
    rate: PlaybackRate,
  ): Promise<void> => {
    playbackPreferences.setPlaybackRate(player, rate)
    // Rate changes reset pitch natively (expo-audio queues PlaybackParameters(
    // rate, 1f) on the main queue); re-assert ours with the same rate — the
    // native pitch setter is dispatched to that queue right after the rate
    // reset, so FIFO ordering makes PlaybackParameters(rate, pitch) win.
    audioEffectsPreferences.reassertPitch()
  }

  public setVolume = async (player: null | PlayableAudio, volume: number): Promise<void> => {
    playbackPreferences.setVolume(player, volume)
  }

  public applyVolume = (player: null | PlayableAudio, volume: number): void => {
    playbackPreferences.applyVolume(player, volume)
  }

  public applyPreferences = (player: null | PlayableAudio): void => {
    this.applyPlaybackRate(player)
    this.reassertVolume(player)
    // Attach last: rate application resets pitch, attach re-applies the stored one.
    audioEffectsAttach.attach(audioEffectsPreferences, player)
  }

  public applyPlaybackRate = (player: null | PlayableAudio): void => {
    playbackPreferences.applyPlaybackRate(player)
  }

  public reassertVolume = (player: null | PlayableAudio): void => {
    playbackPreferences.reassertVolume(player)
  }

  public getStatus = (player: null | PlayableAudio): PlaybackStatus => resolvePlaybackStatus(player)

  public getPlaybackRate = (): PlaybackRate => playbackPreferences.getPlaybackRate()

  public getVolume = (): number => playbackPreferences.getVolume()
}

export const playbackController = new PlaybackController()
