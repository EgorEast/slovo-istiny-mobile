import { Ionicons } from '@expo/vector-icons'
import { useAction, useAtom } from '@reatom/npm-react'
import { type ReactNode, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { CreateLocalPlaylistModal } from 'features/local-playlist-form'
import {
  loadMyPlaylists,
  loadSectionSettings,
  type LocalPlaylistData,
  myPlaylistsAtom,
  myPlaylistsLoadedAtom,
  sectionSettingsAtom,
  sectionSettingsLoadedAtom,
} from 'entities/playlist'
import { mapItemsSize, mapTransform, mapWhereIsTitleLocated } from 'entities/section'
import {
  AVATAR_CONTENT_SIZE_RATIO,
  getSliderItemWidth,
  Slider,
  type SliderItemsElement,
} from 'shared/ui'
import { INDENTS, useTheme } from 'shared/ui/theme'
import { useListenNavigation } from '../lib/useListenNavigation'

const SECTION_TITLE = 'Мои плейлисты'
const CREATE_TITLE = 'Создать'
const CREATE_ICON = 'add'
const FAVORITES_INDEX = 0

// Элемент секции: либо карточка плейлиста, либо завершающая карточка «Создать».
type MyPlaylistsItem = { kind: 'create' } | { kind: 'playlist'; playlist: LocalPlaylistData }

const toPlaylistItem = (
  playlist: LocalPlaylistData,
  artworkIcon?: ReactNode,
): SliderItemsElement<MyPlaylistsItem> => ({
  artwork: null,
  artworkIcon,
  data: { kind: 'playlist', playlist },
  title: playlist.title,
})

const toCreateItem = (icon: ReactNode): SliderItemsElement<MyPlaylistsItem> => ({
  artwork: null,
  artworkIcon: icon,
  data: { kind: 'create' },
  title: CREATE_TITLE,
})

// Завершающая секция экрана «Слушать»: карточка «Избранные», карточки
// локальных плейлистов и завершающая карточка «Создать». Только чтение —
// редактирование порядка живёт на отдельном экране «Мои плейлисты», куда ведёт
// тап по заголовку секции. Внешний вид берётся из настроек оформления
// (`sectionSettingsAtom`).
export const MyPlaylistsSlider = () => {
  const { currentTheme } = useTheme()
  const [playlists] = useAtom(myPlaylistsAtom)
  const [settings] = useAtom(sectionSettingsAtom)
  const [playlistsLoaded] = useAtom(myPlaylistsLoadedAtom)
  const [settingsLoaded] = useAtom(sectionSettingsLoadedAtom)
  const [isCreateVisible, setCreateVisible] = useState(false)
  const loadPlaylists = useAction(loadMyPlaylists)
  const loadSettings = useAction(loadSectionSettings)
  const { navigateToMyPlaylists, navigateToPlaylist } = useListenNavigation()

  // Guarded hydration: the section remounts when the search closes, so only an
  // unloaded store triggers a read. Pull-to-refresh and the import hook call the
  // actions directly and still force a reload.
  useEffect(() => {
    if (!playlistsLoaded) void loadPlaylists()
    if (!settingsLoaded) void loadSettings()
  }, [loadPlaylists, loadSettings, playlistsLoaded, settingsLoaded])

  const favorites = playlists[FAVORITES_INDEX]
  const restPlaylists = playlists.slice(FAVORITES_INDEX + 1)

  const cardWidth = getSliderItemWidth(mapItemsSize(settings.itemsSize))
  const iconSize = cardWidth * AVATAR_CONTENT_SIZE_RATIO
  const heartIcon = <Ionicons name='heart' size={iconSize} color={currentTheme.primary} />
  const addIcon = <Ionicons size={iconSize} name={CREATE_ICON} color={currentTheme.primary} />

  const onPressItem = (item: MyPlaylistsItem) => {
    if (item.kind === 'create') {
      setCreateVisible(true)
      return
    }
    navigateToPlaylist({
      artwork: null,
      id: item.playlist.id,
      sermons: [],
      title: item.playlist.title,
    })
  }

  const items = [
    toPlaylistItem(favorites, heartIcon),
    ...restPlaylists.map(playlist => toPlaylistItem(playlist)),
    toCreateItem(addIcon),
  ]

  return (
    <>
      <Slider
        items={items}
        style={styles.slider}
        title={SECTION_TITLE}
        onPressItem={onPressItem}
        onPressTitle={navigateToMyPlaylists}
        borderRadius={settings.borderRadius}
        itemsRows={settings.itemsRows ?? undefined}
        itemsSize={mapItemsSize(settings.itemsSize)}
        transform={mapTransform(settings.transform)}
        isDescriptionTitleOnSlideLarge={settings.isDescriptionTitleOnSlideLarge}
        whereIsSlideTitleLocated={mapWhereIsTitleLocated(settings.whereIsSlideTitleLocated)}
      />
      <CreateLocalPlaylistModal visible={isCreateVisible} onClose={() => setCreateVisible(false)} />
    </>
  )
}

const styles = StyleSheet.create({
  slider: { paddingHorizontal: INDENTS.middle },
})
