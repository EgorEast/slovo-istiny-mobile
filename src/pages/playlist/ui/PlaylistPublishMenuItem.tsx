import { Ionicons } from '@expo/vector-icons'
import { useTheme } from 'shared/ui/theme'
import { PlaylistMenuRow } from './PlaylistMenuRow'

const ICON_SIZE = 18
const PUBLISH_ICON = 'globe-outline'

export const PUBLISH_TEXT = 'Добавить в глобальные'

export const PlaylistPublishMenuItem = ({
  onPress,
  text,
}: {
  onPress: () => void
  text: string
}) => {
  const { currentTheme } = useTheme()

  return (
    <PlaylistMenuRow
      text={text}
      onPress={onPress}
      icon={<Ionicons size={ICON_SIZE} name={PUBLISH_ICON} color={currentTheme.icon} />}
    />
  )
}
