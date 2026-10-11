import { type ReactNode } from 'react'

/**
 * Строка списка плейлистов, общая для серверного списка секции и просмотрового
 * режима экрана «Мои плейлисты». `artworkNode` имеет приоритет над `artwork`:
 * маркер («Избранные», «Создать плейлист») подменяет обложку, а при отсутствии
 * обоих строка получает плитку-букву (`PlaylistLetterAvatar`).
 */
export interface PlaylistListItemData {
  artwork?: null | string
  artworkNode?: ReactNode
  id: string
  subtitle?: string
  title: string
}
