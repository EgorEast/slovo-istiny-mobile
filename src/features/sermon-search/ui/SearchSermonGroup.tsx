import { Fragment, type ReactElement, type ReactNode } from 'react'
import { type AudioPlayerData, type SermonData } from 'entities/sermon'
import { SearchGroup } from './SearchGroup'
import { SearchResultsRow } from './SearchResultsRow'
import { SearchRowSeparator } from './SearchRowSeparator'

const SERMONS_LABEL = 'Проповеди'
const MAX_SERMON_RESULTS = 4

export const SearchSermonGroup = ({
  firstRowWrapper,
  groupHeaderWrapper,
  historySermonIds,
  onAddToPlaylist,
  onPress,
  onShowAll,
  progressMap,
  sermons,
}: {
  firstRowWrapper?: (row: ReactElement) => ReactNode
  groupHeaderWrapper?: (header: ReactElement) => ReactNode
  historySermonIds: Set<string>
  onAddToPlaylist?: (sermon: AudioPlayerData) => void
  onPress: (sermon: SermonData) => void
  onShowAll: () => void
  progressMap: Map<string, number>
  sermons: SermonData[]
}) => (
  <SearchGroup
    onPress={onShowAll}
    label={SERMONS_LABEL}
    count={sermons.length}
    groupHeaderWrapper={groupHeaderWrapper}
  >
    {sermons.slice(0, MAX_SERMON_RESULTS).map((sermon, index) => {
      const row = (
        <SearchResultsRow
          sermon={sermon}
          onPress={onPress}
          onAddToPlaylist={onAddToPlaylist}
          progress={progressMap.get(sermon.id)}
          inHistory={historySermonIds.has(sermon.id)}
        />
      )

      return (
        <Fragment key={sermon.id}>
          {index === 0 && firstRowWrapper ? firstRowWrapper(row) : row}
          <SearchRowSeparator />
        </Fragment>
      )
    })}
  </SearchGroup>
)
