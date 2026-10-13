import { MAX_CUSTOM_PLAYLIST_SERMONS } from 'entities/playlist'
import { CheckboxField } from 'shared/ui/form'

const LIMIT_MESSAGE = `Достигнут лимит — ${MAX_CUSTOM_PLAYLIST_SERMONS} проповедей`

/**
 * Строка мультивыбора: название плейлиста + чекбокс. Тап по строке переключает
 * только черновик (`onChange`) — итоговый набор применяется по «Сохранить». Если
 * плейлист заполнен до `MAX_CUSTOM_PLAYLIST_SERMONS` и проповеди в нём изначально
 * нет, строка отключена (добавление невозможно) с подсказкой-причиной;
 * содержащую проповедь строку можно снять, поэтому её не блокируем.
 * @param root0 - Пропсы строки.
 * @param root0.isContained - Содержит ли плейлист проповедь изначально.
 * @param root0.onChange - Переключить черновик строки.
 * @param root0.sermonCount - Текущее число проповедей в плейлисте.
 * @param root0.title - Название плейлиста.
 * @param root0.value - Значение черновика (состояние чекбокса).
 */
export const PlaylistMembershipRow = ({
  isContained,
  onChange,
  sermonCount,
  title,
  value,
}: {
  isContained: boolean
  onChange: () => void
  sermonCount: number
  title: string
  value: boolean
}) => {
  const isDisabled = sermonCount >= MAX_CUSTOM_PLAYLIST_SERMONS && !isContained

  return (
    <CheckboxField
      label={title}
      value={value}
      onChange={onChange}
      disabled={isDisabled}
      hint={isDisabled ? LIMIT_MESSAGE : undefined}
    />
  )
}
