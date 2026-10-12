import AsyncStorage from '@react-native-async-storage/async-storage'
import { action } from '@reatom/framework'
import { CURRENT_AUDIO, CURRENT_PLAYLIST } from 'shared/config'
import {
  currentAudioAtom,
  currentPlaylistAtom,
  durationAtom,
  isBufferingAtom,
  isPlayingAtom,
  positionAtom,
} from './model'

/**
 * Полностью закрывает плеер: освобождает нативный игрок (`unload` убирает
 * нотификейшн-бар нативно), удаляет сохранённые текущие аудио/плейлист — после
 * этого холодный старт их не восстановит, — и обнуляет активные состояния,
 * из-за чего скрываются миниплеер и полноэкранный плеер, а очередь пустеет.
 *
 * Отказ `unload` логируется, но UI всё равно закрывается: очистка состояний
 * должна пройти независимо от нативной ошибки.
 *
 * `playerService` грузится динамически: этот модуль переэкспортируется в
 * `entities/playlist` (`@x/playlist`), и статический импорт затягивал бы
 * `expo-audio` в граф каждой сущности/теста, которые лишь импортируют
 * `entities/playlist` (тот же приём, что в `ensureNotifications`).
 */
export const resetPlaybackAction = action(async ctx => {
  const { playerService } = await import('./lib/PlayerService')
  try {
    await playerService.unload()
  } catch (error) {
    console.error('[player] unload failed:', error)
  }
  await AsyncStorage.multiRemove([CURRENT_AUDIO, CURRENT_PLAYLIST])
  await ctx.schedule(() => {
    currentAudioAtom(ctx, null)
    currentPlaylistAtom(ctx, null)
    isPlayingAtom(ctx, false)
    positionAtom(ctx, 0)
    durationAtom(ctx, 0)
    isBufferingAtom(ctx, false)
  })
}, 'resetPlayback')
