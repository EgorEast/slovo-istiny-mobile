import { type AudioEffectsInfo, type AudioEffectsSettings, detachAudioEffects } from 'audio-effects'
import { applyNativeSafely } from './applyNativeSafely'
import { attachWithCapabilities, refreshCapabilities } from './audioEffectsCapabilities'
import { type PlayableAudio } from './playableAudio'

// Surface the attach lifecycle needs from the preferences values store.
interface AudioEffectsSource {
  getSettings: () => AudioEffectsSettings
  syncDeviceGains: (info: AudioEffectsInfo) => void
}

/**
 * Attach lifecycle for the audio-effects chain: stored settings must be
 * re-attached on every queue build/replace (a fresh AudioPlaylist owns the
 * ExoPlayer per build) and detached before the player dies with its audio
 * session. Attach runs last in applyPreferences — rate application resets
 * pitch natively, attach restores it.
 */
class AudioEffectsAttach {
  public attach = (source: AudioEffectsSource, player: null | PlayableAudio): void => {
    if (!player) return
    this.currentPlayer = player
    applyNativeSafely(() => {
      attachWithCapabilities(player, source.getSettings())
        .then(info => source.syncDeviceGains(info))
        .catch((error: unknown) => console.error('[AudioEffectsPreferences] attach failed:', error))
    })
  }

  // Safety net for screens needing capabilities before the next track load.
  // The refresh runs even with no player: the web implementation reports its
  // static capabilities, and native falls back to defaults until first attach.
  public attachToCurrentPlayer = (source: AudioEffectsSource): void => {
    if (this.currentPlayer) this.attach(source, this.currentPlayer)
    applyNativeSafely(refreshCapabilities)
  }

  public detach = (): void => {
    this.currentPlayer = null
    applyNativeSafely(() => detachAudioEffects())
  }

  private currentPlayer: null | PlayableAudio = null
}

export const audioEffectsAttach = new AudioEffectsAttach()
