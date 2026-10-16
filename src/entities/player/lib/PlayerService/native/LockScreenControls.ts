import { type AudioPlayer } from 'expo-audio'
import { AppState } from 'react-native'
import { getLocalAppIconUri, hasUriProtocol } from 'shared/lib/app-icon'
import { isExpoGo } from 'shared/lib/isExpoEnvironment'
import { reportError } from 'shared/model/error-dialog'
import { type LockScreenMetadata } from '../types'
import { loadedRetryScheduler } from './LoadedRetryScheduler'

const LOCK_SCREEN_ERROR_MESSAGE = 'Не удалось обновить данные плеера на экране блокировки'

type MetadataPayload = { artworkUrl?: string } & Omit<LockScreenMetadata, 'artworkUrl'>

class LockScreenControls {
  public setMetadata = (player: AudioPlayer | null, metadata: LockScreenMetadata): void => {
    if (!player) return

    // Same player (track switch): update metadata in place — keeps the existing
    // MediaSession/notification alive without a teardown race.
    // New player (first play / after unload): full activation required.
    const isSamePlayer = player === this.activePlayer
    const apply = () => {
      if (isSamePlayer) this.updateMetadata(player, metadata)
      else this.activateWhenForeground(player, metadata)
    }

    if (!isSamePlayer) this.activePlayer = player

    loadedRetryScheduler.schedule(() => player.isLoaded, apply)
  }

  // Foreground re-assertion: ALWAYS takes the full activation path
  // (setActiveForLockScreen(true)) even for the already-tracked player.
  // Unlike setMetadata's in-place update path, this re-binds the media session
  // natively — required when the OS/OEM killed the foreground service and every
  // track switch went through the (silently dropped) update path.
  public reassertMetadata = (player: AudioPlayer | null, metadata: LockScreenMetadata): void => {
    if (!player) return

    // Force full activation on subsequent setMetadata calls too
    this.activePlayer = player

    loadedRetryScheduler.schedule(
      () => player.isLoaded,
      () => this.activateWhenForeground(player, metadata),
    )
  }

  public clear = (player: AudioPlayer | null): void => {
    // Invalidate any in-flight retry loop and pending activation from a previous call
    loadedRetryScheduler.invalidate()
    this.activePlayer = null
    this.pendingActivation = null
    this.activationSubscription?.remove()
    this.activationSubscription = null

    if (!player?.isLoaded || isExpoGo) return

    try {
      player.setActiveForLockScreen(false)
    } catch (error) {
      console.error('[LockScreenControls] setActiveForLockScreen failed:', error)
      reportError(error, LOCK_SCREEN_ERROR_MESSAGE)
    }
  }

  // Full activation starts the expo-audio foreground service. Android 12+ forbids
  // starting an FGS while the app is not foreground-permitted — expo-audio catches
  // ForegroundServiceStartNotAllowedException and logs "Failed to start the
  // expo-audio foreground service...". Cold-start restore can reach this while
  // paused/backgrounded, so defer to the next foreground transition: lock-screen
  // controls still appear via the notification fallback and activate then.
  private activateWhenForeground = (player: AudioPlayer, metadata: LockScreenMetadata): void => {
    if (AppState.currentState === 'active') return this.activateMetadata(player, metadata)

    this.pendingActivation = { metadata, player }
    if (this.activationSubscription) return

    this.activationSubscription = AppState.addEventListener('change', state => {
      if (state !== 'active') return

      this.activationSubscription?.remove()
      this.activationSubscription = null
      const pending = this.pendingActivation
      this.pendingActivation = null
      // clear() nulls activePlayer, dropping a stale pending activation.
      if (pending && pending.player === this.activePlayer)
        this.activateMetadata(pending.player, pending.metadata)
    })
  }

  private prepareMetadataPayload = (metadata: LockScreenMetadata): MetadataPayload => {
    const artworkUrl = [metadata.artworkUrl, getLocalAppIconUri()].find(hasUriProtocol)
    const { artworkUrl: _ignored, ...metadataWithoutArtwork } = metadata

    return { ...metadataWithoutArtwork, ...(artworkUrl ? { artworkUrl } : {}) }
  }

  private activateMetadata = (player: AudioPlayer, metadata: LockScreenMetadata): void => {
    if (isExpoGo) return

    try {
      player.setActiveForLockScreen(true, this.prepareMetadataPayload(metadata), {
        isLiveStream: false,
        showSeekBackward: true,
        showSeekForward: true,
      })
    } catch (error) {
      console.error('[LockScreenControls] setActiveForLockScreen failed:', error)
      reportError(error, LOCK_SCREEN_ERROR_MESSAGE)
    }
  }

  private updateMetadata = (player: AudioPlayer, metadata: LockScreenMetadata): void => {
    if (isExpoGo) return

    try {
      player.updateLockScreenMetadata(this.prepareMetadataPayload(metadata))
    } catch (error) {
      console.error('[LockScreenControls] updateLockScreenMetadata failed:', error)
      reportError(error, LOCK_SCREEN_ERROR_MESSAGE)
    }
  }

  private activePlayer: AudioPlayer | null = null
  private activationSubscription: null | ReturnType<typeof AppState.addEventListener> = null
  private pendingActivation: { metadata: LockScreenMetadata; player: AudioPlayer } | null = null
}

export const lockScreenControls = new LockScreenControls()
