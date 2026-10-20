import { ctx } from 'shared/lib/reatom-ctx'
import { applyVolumeAction, setVolumeAction } from '../../../model'
import { type PlaybackRate, setPlaybackRateAction } from '../../../playback-rate'
import { type PlayableAudio, setPlayablePlaybackRate } from './playableAudio'

const MIN_VOLUME = 0
const MAX_VOLUME = 1
const DEFAULT_PLAYBACK_RATE: PlaybackRate = 1
const DEFAULT_VOLUME = 1

/**
 * Persisted playback preferences (rate and volume) that must outlive a player
 * instance. A freshly created AudioPlayer/AudioPlaylist always starts at rate 1
 * / volume 1, so `applyPlaybackRate` / `applyVolume` re-apply the stored values
 * once the new instance is ready (see PlayerService.loadAudio / replaceAudio).
 */
class PlaybackPreferences {
  public setPlaybackRate = (player: null | PlayableAudio, rate: PlaybackRate): void => {
    this.playbackRate = rate
    if (player) setPlayablePlaybackRate(player, rate)
    void setPlaybackRateAction(ctx, rate)
  }

  // Commit path: live-apply plus the AsyncStorage write (slider release, reset).
  public setVolume = (player: null | PlayableAudio, volume: number): void => {
    this.applyVolume(player, volume)
    void setVolumeAction(ctx, this.volume)
  }

  // Live path: native volume + sync atom update on every drag tick, no persist.
  public applyVolume = (player: null | PlayableAudio, volume: number): void => {
    this.volume = Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume))

    if (player?.isLoaded) player.volume = this.volume

    applyVolumeAction(ctx, this.volume)
  }

  public applyPlaybackRate = (player: null | PlayableAudio): void => {
    if (this.playbackRate === DEFAULT_PLAYBACK_RATE) return
    if (!player?.isLoaded) return

    setPlayablePlaybackRate(player, this.playbackRate)
  }

  public reassertVolume = (player: null | PlayableAudio): void => {
    if (this.volume === DEFAULT_VOLUME) return
    if (!player?.isLoaded) return

    player.volume = this.volume
  }

  public getPlaybackRate = (): PlaybackRate => this.playbackRate

  public getVolume = (): number => this.volume

  private playbackRate: PlaybackRate = DEFAULT_PLAYBACK_RATE
  private volume = DEFAULT_VOLUME
}

export const playbackPreferences = new PlaybackPreferences()
