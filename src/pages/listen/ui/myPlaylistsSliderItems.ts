import { type ReactNode } from 'react'
import { type LocalPlaylistData } from 'entities/playlist'
import { type SliderItemsElement } from 'shared/ui'

const CREATE_TITLE = 'Создать'
const FAVORITES_INDEX = 0

// Элемент секции: либо карточка плейлиста, либо завершающая карточка «Создать».
export type MyPlaylistsItem = { kind: 'create' } | { kind: 'playlist'; playlist: LocalPlaylistData }

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

// Собирает карточки секции: «Избранные», локальные плейлисты и завершающая «Создать».
export const buildMyPlaylistsItems = (
  playlists: LocalPlaylistData[],
  heartIcon: ReactNode,
  addIcon: ReactNode,
): SliderItemsElement<MyPlaylistsItem>[] => [
  toPlaylistItem(playlists[FAVORITES_INDEX], heartIcon),
  ...playlists.slice(FAVORITES_INDEX + 1).map(playlist => toPlaylistItem(playlist)),
  toCreateItem(addIcon),
]
