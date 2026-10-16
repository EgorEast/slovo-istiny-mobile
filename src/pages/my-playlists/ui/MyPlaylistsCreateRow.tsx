import { Ionicons } from '@expo/vector-icons'
import { OnboardingTarget } from 'features/onboarding'
import { LIST_ITEM_CARD_ARTWORK_SIZE, ListItemBase } from 'entities/list-item'
import { INDENTS, useTheme } from 'shared/ui/theme'
import { MyPlaylistsMarkerAvatar } from './MyPlaylistsMarkerAvatar'

const CREATE_ICON = 'add'
const CREATE_TITLE = 'Создать плейлист'
// Card rows carry no own bottom margin (the server list spaces them with a
// separator); this list has none, so the row keeps the previous rhythm.
const ROW_STYLE = { marginBottom: INDENTS.medium }

// Строка «Создать плейлист»: завершает список (футер), не перетаскивается.
// Плюс лежит в слоте обложки `card`-строки серверного списка плейлистов
// (`PlaylistListItem`), поэтому кнопка совпадает по размеру со строками
// плейлистов.
export const MyPlaylistsCreateRow = ({
  onboardingTargetId,
  onPress,
}: {
  onboardingTargetId?: string
  onPress: () => void
}) => {
  const { currentTheme } = useTheme()

  return (
    <OnboardingTarget id={onboardingTargetId}>
      <ListItemBase
        onPress={onPress}
        style={ROW_STYLE}
        title={CREATE_TITLE}
        artworkNode={
          <MyPlaylistsMarkerAvatar
            size={LIST_ITEM_CARD_ARTWORK_SIZE}
            renderIcon={iconSize => (
              <Ionicons size={iconSize} name={CREATE_ICON} color={currentTheme.primary} />
            )}
          />
        }
      />
    </OnboardingTarget>
  )
}
