import { Ionicons } from '@expo/vector-icons'
import { useTheme } from 'shared/ui/theme'
import { PlaylistMenuRow } from './PlaylistMenuRow'

const ICON_SIZE = 18
const ADD_ALL_ICON = 'add-circle'
const ADD_ALL_TEXT = 'Добавить все проповеди в плейлист'

/**
 * Пункт «Добавить все проповеди в плейлист» для меню шапки плейлиста. Открывает
 * батч-режим модалки добавления (выбор целевого плейлиста), поэтому рендерится
 * только на экране плейлиста и при непустом плейлисте.
 * @param root0 - Пропсы пункта.
 * @param root0.onPress - Открыть батч-модалку добавления.
 */
export const PlaylistAddAllMenuItem = ({ onPress }: { onPress: () => void }) => {
  const { currentTheme } = useTheme()

  return (
    <PlaylistMenuRow
      onPress={onPress}
      text={ADD_ALL_TEXT}
      icon={<Ionicons size={ICON_SIZE} name={ADD_ALL_ICON} color={currentTheme.icon} />}
    />
  )
}
