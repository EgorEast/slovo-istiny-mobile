import { useCallback, useEffect, useMemo, useRef } from 'react'
import { OnboardingHelpRow } from 'features/onboarding'
import { useTheme } from 'shared/ui/theme'
import { MyPlaylistsHeaderActions } from '../ui/MyPlaylistsHeaderActions'

const SCREEN_TITLE = 'Мои плейлисты'

/**
 * Опции шапки экрана «Мои плейлисты»: заголовок секции и действия справа —
 * карандаш «Изменить порядок» (в обычном режиме) и, в режиме редактирования,
 * галочка «Сохранить» (карандаш при этом скрыт).
 *
 * В обычном режиме нативная шапка прозрачна (как у серверного списка плейлистов):
 * большой заголовок рисует сам список (`PlaylistList`), а в шапке остаётся
 * только карандаш. В режиме редактирования шапка снова непрозрачна и возвращает
 * заголовок «Мои плейлисты» (в представлении редактирования большого заголовка
 * нет).
 *
 * Свежие обработчики держим в ref (синхронизация в эффекте, не во время
 * рендера): кнопки вызывают актуальные обработчики, но идентичность
 * `headerRight` не меняется на каждый рендер — иначе expo-router ушёл бы в
 * «Maximum update depth exceeded». Режим редактирования входит в зависимости
 * memo: смена режима обязана пересобрать `headerRight` (иначе иконки шапки
 * не обновятся) и переключить прозрачность/заголовок шапки.
 * @param root0 Параметры шапки.
 * @param root0.isEditing Открыт ли режим редактирования.
 * @param root0.onSave Коммит локального порядка.
 * @param root0.onToggleEdit Вход в режим редактирования.
 */
export const useMyPlaylistsHeader = ({
  isEditing,
  onSave,
  onToggleEdit,
}: {
  isEditing: boolean
  onSave: () => void
  onToggleEdit: () => void
}) => {
  const { currentTheme } = useTheme()
  const onSaveRef = useRef(onSave)
  const onToggleEditRef = useRef(onToggleEdit)

  useEffect(() => {
    onSaveRef.current = onSave
    onToggleEditRef.current = onToggleEdit
  })

  const handleSave = useCallback(() => onSaveRef.current(), [])
  const handleToggleEdit = useCallback(() => onToggleEditRef.current(), [])

  const headerRight = useMemo(
    () => () => (
      <OnboardingHelpRow>
        <MyPlaylistsHeaderActions
          onSave={handleSave}
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
        />
      </OnboardingHelpRow>
    ),
    [handleSave, handleToggleEdit, isEditing],
  )

  const background = currentTheme.background

  return useMemo(
    () =>
      isEditing
        ? {
            headerRight,
            headerStyle: { backgroundColor: background },
            headerTransparent: false,
            title: SCREEN_TITLE,
          }
        : {
            headerRight,
            headerStyle: { backgroundColor: 'transparent' },
            headerTransparent: true,
            title: '',
          },
    [background, headerRight, isEditing],
  )
}
