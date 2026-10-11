import { useCallback } from 'react'
import { type RenderItemParams } from 'react-native-draggable-flatlist'
import { type SermonShape } from 'shared/model'
import { PlaylistEditSermonRow } from './PlaylistEditSermonRow'

/**
 * Builds the stable `DraggableFlatList` renderer for the edit screen's sermon
 * rows. A row depends only on its own item and drag state, so the renderer holds
 * no form state and keeps its identity across keystrokes — a 200-row list no
 * longer re-renders on every character typed into the title field.
 * @returns A memoized row renderer.
 */
export const usePlaylistEditItemRenderer = () =>
  useCallback(
    ({ drag, isActive, item }: RenderItemParams<SermonShape>) => (
      <PlaylistEditSermonRow item={item} drag={drag} isActive={isActive} />
    ),
    [],
  )
