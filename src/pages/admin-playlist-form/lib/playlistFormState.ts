import z from 'zod'
import { type APITypes } from 'shared/api'
import { type SermonOption } from './sermonOption'

export interface PlaylistFormValues {
  artwork: string
  description: string
  selectedSectionIds: string[]
  selectedSermonIds: string[]
  title: string
}

export const initialFormValues = (
  initial?: APITypes.PlaylistEntity | null,
): PlaylistFormValues => ({
  artwork: initial?.artwork ?? '',
  description: initial?.description ?? '',
  selectedSectionIds: initial?.sections.map(section => section.id) ?? [],
  selectedSermonIds: initial?.sermons.map(sermon => sermon.id) ?? [],
  title: initial?.title ?? '',
})

const buildCommonFields = (values: PlaylistFormValues) => ({
  artwork: values.artwork.trim(),
  description: values.description.trim() || null,
  sectionsIds: values.selectedSectionIds,
  sermonsIds: values.selectedSermonIds,
  title: values.title.trim(),
})

export const buildCreatePlaylistDto = (values: PlaylistFormValues): APITypes.CreatePlaylistDto =>
  buildCommonFields(values)

export const buildUpdatePlaylistDto = (values: PlaylistFormValues): APITypes.UpdatePlaylistDto =>
  buildCommonFields(values)

/**
 * Parses the `sermonIds` route parameter (comma-separated) into a clean list.
 * @param value - Raw route parameter, possibly an array on a deep link.
 * @returns Non-empty, trimmed ids in the given order.
 */
export const parseSermonIdsParam = (value: string | string[] | undefined): string[] => {
  const raw = Array.isArray(value) ? value.join(',') : value
  if (!raw) return []
  return raw
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0)
}

/**
 * Parses the `title` route parameter into a plain string.
 * @param value - Raw route parameter, possibly an array on a deep link.
 * @returns The first value, or an empty string.
 */
export const parseTitleParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

// Запись снапшота проповеди в параметре публикации. Полная запись несёт
// title/artist/artwork и рендерится строкой пикера; id-only (без снапшота) —
// только id, выбор сохраняется, строка не рендерится.
const publishSermonEntrySchema = z.object({
  artist: z.string().optional(),
  artwork: z.string().nullable().optional(),
  id: z.string(),
  title: z.string().optional(),
})

const publishSermonsSchema = z.array(publishSermonEntrySchema)

/** Разобранный параметр `sermons`: id всех записей и рендерящиеся снапшоты. */
export interface ParsedPublishSermons {
  ids: string[]
  sermons: SermonOption[]
}

/**
 * Parses the `sermons` route parameter (JSON snapshots) into ids and picker rows.
 *
 * Every entry contributes its id (order preserved); entries without a full
 * snapshot (id-only) contribute only an id, so a shared id-only playlist keeps
 * its selection even though no row can be rendered. Malformed JSON degrades to
 * an empty result rather than throwing.
 * @param value - Raw route parameter, possibly an array on a deep link.
 * @returns Selected ids and the renderable sermon snapshots.
 */
export const parsePublishSermonsParam = (
  value: string | string[] | undefined,
): ParsedPublishSermons => {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return { ids: [], sermons: [] }

  try {
    const parsed = publishSermonsSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return { ids: [], sermons: [] }

    const ids = parsed.data.map(entry => entry.id)
    const sermons = parsed.data.flatMap(entry => {
      if (entry.title === undefined || entry.artist === undefined) return []
      return [
        {
          artist: entry.artist,
          artwork: entry.artwork ?? null,
          id: entry.id,
          title: entry.title,
        },
      ]
    })
    return { ids, sermons }
  } catch {
    // JSON.parse threw on a non-JSON payload — treat it as absent.
    return { ids: [], sermons: [] }
  }
}
