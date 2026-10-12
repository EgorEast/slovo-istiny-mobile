import { useAction, useAtom } from '@reatom/npm-react'
import { type ReactElement, useEffect } from 'react'
import { OnboardingTarget } from 'features/onboarding'
import { type PlaylistData } from 'entities/playlist'
import {
  dynamicSectionsAtom,
  fetchAllSections,
  isLoadingSectionsAtom,
  type SectionData,
  sectionDataSourceAtom,
} from 'entities/section'
import { useOfflineRetry } from 'shared/lib/network'
import { EmptyState } from 'shared/ui'
import { getFirstSectionLayout } from '../lib/first-section-layout'
import { useListenNavigation } from '../lib/useListenNavigation'
import { FirstSectionRow } from './FirstSectionRow'
import { renderSection } from './renderSection'
import { SectionsSkeleton } from './skeleton'

export const DynamicSectionsSlider = ({
  leadingElement,
  onboardingTargetId,
}: {
  leadingElement?: ReactElement
  onboardingTargetId?: string
}) => {
  const { navigateToPlaylist, navigateToPlaylistList } = useListenNavigation()
  const [sections] = useAtom(dynamicSectionsAtom)
  const [isLoading] = useAtom(isLoadingSectionsAtom)
  const [dataSource] = useAtom(sectionDataSourceAtom)
  const fetchSections = useAction(fetchAllSections)

  // `'unknown'` means sections were never fetched (neither cache nor network).
  // On a remount — the sliders unmount while the search is active — the already
  // loaded sections must not trigger another network revalidation. Pull-to-refresh
  // calls the action directly, so it still forces a reload.
  useEffect(() => {
    if (dataSource !== 'unknown') return
    void fetchSections()
  }, [dataSource, fetchSections])

  useOfflineRetry({
    fetchFn: fetchSections,
    hasCachedData: dataSource === 'cache',
    isLoading,
    needsRetry: dataSource !== 'network',
  })

  const onItemPress = (playlist: PlaylistData) => {
    navigateToPlaylist(playlist)
  }

  const renderSectionAt = (section: SectionData, index: number) =>
    renderSection({ index, navigateToPlaylistList, onItemPress, section })

  const renderSectionsFrom = (fromIndex: number) =>
    sections.slice(fromIndex).map((section, offset) => renderSectionAt(section, fromIndex + offset))

  const renderContent = () => {
    if (leadingElement) {
      if (sections.length === 0) {
        if (isLoading) {
          const layout = getFirstSectionLayout(sections, isLoading)

          return (
            <>
              <FirstSectionRow
                button={leadingElement}
                stacked={layout.stacked}
                section={<SectionsSkeleton count={1} />}
                sectionMinWidth={layout.sectionMinWidth}
              />
              <SectionsSkeleton from={1} />
            </>
          )
        }

        return <FirstSectionRow button={leadingElement} section={<EmptyState />} />
      }

      const layout = getFirstSectionLayout(sections, isLoading)

      return (
        <>
          <FirstSectionRow
            button={leadingElement}
            stacked={layout.stacked}
            sectionMinWidth={layout.sectionMinWidth}
            section={renderSectionAt(sections[0], 0)}
          />
          {renderSectionsFrom(1)}
        </>
      )
    }

    if (sections.length === 0) return isLoading ? <SectionsSkeleton /> : <EmptyState />

    return <>{renderSectionsFrom(0)}</>
  }

  return <OnboardingTarget id={onboardingTargetId}>{renderContent()}</OnboardingTarget>
}
