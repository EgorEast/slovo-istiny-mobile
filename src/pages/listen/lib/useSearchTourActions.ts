import { useAtom } from '@reatom/npm-react'
import { useCallback, useEffect, useRef } from 'react'
import { useTourActionRegistrar } from 'features/onboarding'
import { searchQueryAtom, searchResultsAtom } from 'features/sermon-search'
import { type SermonData } from 'entities/sermon'

const TYPE_SEARCH_QUERY_ACTION_ID = 'type-search-query'
const PRESS_FIRST_SERMON_ACTION_ID = 'press-first-sermon'
const SEARCH_QUERY = 'лицемерие'
const TYPE_STEP_MS = 120

/**
 * Registers the search tour's actions on behalf of the page: the tour types the
 * demo query into the real search atom (prefix by prefix, cancellable) and presses
 * the first rendered sermon. The page owns these because `features/sermon-search`
 * must not import `features/onboarding` (dependency inversion).
 * @param root0 - Hook input.
 * @param root0.onPressFirstSermon - Page-owned handler that starts playback of a sermon.
 */
export const useSearchTourActions = ({
  onPressFirstSermon,
}: {
  onPressFirstSermon: (sermon: SermonData) => void
}) => {
  const [, setQuery] = useAtom(searchQueryAtom)
  const [sermons] = useAtom(searchResultsAtom)
  const typingTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null)

  const typeQuery = useCallback(() => {
    if (typingTimerRef.current !== null) clearTimeout(typingTimerRef.current)
    let typedCount = 0

    const typeNextChar = () => {
      typedCount += 1
      setQuery(SEARCH_QUERY.slice(0, typedCount))
      typingTimerRef.current =
        typedCount < SEARCH_QUERY.length ? setTimeout(typeNextChar, TYPE_STEP_MS) : null
    }

    typeNextChar()
  }, [setQuery])

  const pressFirstSermon = useCallback(() => {
    const firstSermon = sermons[0]
    if (firstSermon === undefined) return

    onPressFirstSermon(firstSermon)
  }, [onPressFirstSermon, sermons])

  useEffect(
    () => () => {
      if (typingTimerRef.current !== null) clearTimeout(typingTimerRef.current)
    },
    [],
  )

  useTourActionRegistrar(TYPE_SEARCH_QUERY_ACTION_ID, typeQuery)
  useTourActionRegistrar(PRESS_FIRST_SERMON_ACTION_ID, pressFirstSermon)
}
