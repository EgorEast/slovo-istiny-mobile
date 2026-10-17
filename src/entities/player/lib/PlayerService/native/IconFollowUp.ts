import { type AudioPlayer } from 'expo-audio'
import { getLocalAppIconUri, hasUriProtocol, whenAppIconReady } from 'shared/lib/app-icon'
import { type LockScreenMetadata } from '../types'

type ReapplyMetadata = (player: AudioPlayer, metadata: LockScreenMetadata) => void

/**
 * Догоняет первый показ метаданных lock screen, если фолбэк-иконка ещё не
 * загрузилась: при первой такой попытке подписывается на `whenAppIconReady()`
 * и после появления иконки один раз переустанавливает те же метаданные
 * (см. Docs/features/player.md).
 * @param reapply - Переустанавливает метаданные для того же плеера.
 */
export const createIconFollowUp = (reapply: ReapplyMetadata) => {
  let lastPlayer: AudioPlayer | null = null
  let lastMetadata: LockScreenMetadata | null = null
  let subscribed = false

  const clearPayload = (): void => {
    lastPlayer = null
    lastMetadata = null
  }

  const subscribeOnce = (): void => {
    if (subscribed) return
    subscribed = true
    void whenAppIconReady().then(uri => {
      if (!uri || !lastPlayer || !lastMetadata) return
      const player = lastPlayer
      const metadata = lastMetadata
      clearPayload()
      reapply(player, metadata)
    })
  }

  /**
   * Запоминает показ без артворка и один раз подписывается на загрузку иконки.
   * @param player - Плеер, которому принадлежит показ.
   * @param metadata - Метаданные показа.
   */
  const track = (player: AudioPlayer, metadata: LockScreenMetadata): void => {
    if (hasUriProtocol(metadata.artworkUrl) || getLocalAppIconUri() !== null) {
      clearPayload()
      return
    }

    lastPlayer = player
    lastMetadata = metadata
    subscribeOnce()
  }

  /** Сбрасывает отложенное обновление (например, при выгрузке плеера). */
  const clear = (): void => {
    clearPayload()
    subscribed = false
  }

  return { clear, track }
}
