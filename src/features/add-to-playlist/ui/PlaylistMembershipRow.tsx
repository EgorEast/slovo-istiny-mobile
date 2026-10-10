import { useCtx } from '@reatom/npm-react'
import { MAX_CUSTOM_PLAYLIST_SERMONS, togglePlaylistSermon } from 'entities/playlist'
import { type SermonData } from 'entities/sermon'
import { CheckboxField } from 'shared/ui/form'

const LIMIT_MESSAGE = `Достигнут лимит — ${MAX_CUSTOM_PLAYLIST_SERMONS} проповедей`

/**
 * Строка мультивыбора: название плейлиста + чекбокс. Тап по строке немедленно
 * переключает принадлежность проповеди (оптимистичный экшен сущности), не
 * закрывая модалку — так работает мультивыбор. Если плейлист заполнен до
 * `MAX_CUSTOM_PLAYLIST_SERMONS` и проповеди в нём ещё нет, строка отключена
 * (добавление невозможно) с подсказкой-причиной; содержащую проповедь строку
 * можно снять, поэтому её не блокируем.
 * @param root0 - Пропсы строки.
 * @param root0.isContained - Содержит ли плейлист проповедь (состояние чекбокса).
 * @param root0.playlistId - Id плейлиста.
 * @param root0.sermon - Полная проповедь (снапшот сохраняется при добавлении).
 * @param root0.sermonCount - Текущее число проповедей в плейлисте.
 * @param root0.title - Название плейлиста.
 */
export const PlaylistMembershipRow = ({
  isContained,
  playlistId,
  sermon,
  sermonCount,
  title,
}: {
  isContained: boolean
  playlistId: string
  sermon: SermonData
  sermonCount: number
  title: string
}) => {
  const ctx = useCtx()
  const isDisabled = sermonCount >= MAX_CUSTOM_PLAYLIST_SERMONS && !isContained

  const handleChange = () => {
    void togglePlaylistSermon(ctx, playlistId, sermon, !isContained)
  }

  return (
    <CheckboxField
      label={title}
      value={isContained}
      disabled={isDisabled}
      onChange={handleChange}
      hint={isDisabled ? LIMIT_MESSAGE : undefined}
    />
  )
}
