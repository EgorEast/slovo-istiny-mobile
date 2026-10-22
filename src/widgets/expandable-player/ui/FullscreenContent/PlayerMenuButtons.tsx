import { Entypo, Ionicons } from '@expo/vector-icons'
import { OnboardingTarget } from 'features/onboarding'
import { type AudioPlayerData } from 'entities/sermon'
import { IconButton } from 'shared/ui/icon-button'
import { useTheme } from 'shared/ui/theme'
import { type createStyles } from '../ExpandablePlayer/styles'

const ADD_TO_FAVORITES_LABEL = 'Добавить в избранное'
const REMOVE_FROM_FAVORITES_LABEL = 'Убрать из избранного'
const ADD_TO_PLAYLIST_LABEL = 'Добавить в плейлист'
const MENU_LABEL = 'Меню плеера'
const FAVORITE_TARGET_ID = 'player-fullscreen.favorite'
const ADD_TO_PLAYLIST_TARGET_ID = 'player-fullscreen.add-to-playlist'

/**
 * Кнопки полноэкранного плеера: [♥][＋][⋮].
 *
 * Сердечко переключает избранное, плюс открывает «Добавить в плейлист»,
 * ⋮ — поповер меню. Кластер собран отдельно, чтобы якорь меню оставался
 * логикой, а не разметкой.
 * @param root0 - Свойства кластера.
 * @param root0.audio - Текущая проповедь (уходит в обработчик добавления).
 * @param root0.isFavorite - Проповедь уже в «Избранном».
 * @param root0.onAddToPlaylist - Открывает модалку добавления в плейлист.
 * @param root0.onOpenMenu - Открывает поповер меню.
 * @param root0.onboardingTargetId - Цель тура для кнопки меню.
 * @param root0.onToggleFavorite - Переключает избранное.
 * @param root0.styles - Стили полноэкранного плеера.
 */
export const PlayerMenuButtons = ({
  audio,
  isFavorite,
  onAddToPlaylist,
  onboardingTargetId,
  onOpenMenu,
  onToggleFavorite,
  styles,
}: {
  audio: AudioPlayerData
  isFavorite: boolean
  onAddToPlaylist?: (sermon: AudioPlayerData) => void
  onboardingTargetId?: string
  onOpenMenu: () => void
  onToggleFavorite: () => void
  styles: ReturnType<typeof createStyles>
}) => {
  const { currentTheme } = useTheme()

  return (
    <>
      <OnboardingTarget id={FAVORITE_TARGET_ID}>
        <IconButton
          style={styles.menuButton}
          onPress={onToggleFavorite}
          accessibilityLabel={isFavorite ? REMOVE_FROM_FAVORITES_LABEL : ADD_TO_FAVORITES_LABEL}
          Icon={
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              style={[styles.menuIcon, isFavorite && { color: currentTheme.primary }]}
            />
          }
        />
      </OnboardingTarget>
      <OnboardingTarget id={ADD_TO_PLAYLIST_TARGET_ID}>
        <IconButton
          style={styles.menuButton}
          onPress={() => onAddToPlaylist?.(audio)}
          accessibilityLabel={ADD_TO_PLAYLIST_LABEL}
          Icon={<Ionicons style={styles.menuIcon} name='add-circle-outline' />}
        />
      </OnboardingTarget>
      <OnboardingTarget id={onboardingTargetId}>
        <IconButton
          onPress={onOpenMenu}
          style={styles.menuButton}
          accessibilityLabel={MENU_LABEL}
          Icon={<Entypo style={styles.menuIcon} name='dots-three-vertical' />}
        />
      </OnboardingTarget>
    </>
  )
}
