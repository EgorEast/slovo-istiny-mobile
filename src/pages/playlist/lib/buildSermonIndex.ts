import { type LocalPlaylistData } from 'entities/playlist'
import { type SectionData } from 'entities/section'
import { type SermonShape } from 'shared/model'

/**
 * Indexes every sermon reachable without a network call — section playlists plus
 * snapshots stored in local playlists — so an id-only local playlist can render
 * whatever data the device already holds.
 * @param sections - Currently loaded dynamic sections.
 * @param localPlaylists - Local playlists holding sermon snapshots.
 * @returns Sermon id → sermon map; the first occurrence of an id wins.
 */
export const buildSermonIndex = (
  sections: SectionData[],
  localPlaylists: LocalPlaylistData[],
): Map<string, SermonShape> => {
  const index = new Map<string, SermonShape>()
  const addSermon = (sermon: SermonShape) => {
    if (!index.has(sermon.id)) index.set(sermon.id, sermon)
  }

  for (const section of sections)
    for (const playlist of section.playlists ?? [])
      for (const sermon of playlist.sermons) addSermon(sermon)
  for (const playlist of localPlaylists) for (const sermon of playlist.sermons) addSermon(sermon)

  return index
}
