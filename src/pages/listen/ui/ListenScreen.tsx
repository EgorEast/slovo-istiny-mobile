import { useAction, useAtom } from '@reatom/npm-react'
import { useEffect } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAddToPlaylistModal } from 'features/add-to-playlist'
import { useTourActionRegistrar, useTourScrollable } from 'features/onboarding'
import {
  SearchGroupedResults,
  useIsSearchActive,
  useIsSearchOpen,
  useOpenSearch,
  useSearchUrlSync,
  useSermonPlayback,
} from 'features/sermon-search'
import { authStatusAtom, authUserAtom, canAccessAdmin, restoreSession } from 'entities/auth'
import { createRefreshControl, PullToRefresh } from 'shared/ui'
import { tabBarHeightAtom } from 'shared/ui/layout'
import { PLAYER_SIZES, useTheme } from 'shared/ui/theme'
import { useListenSearchNavigation } from '../lib/useListenSearchNavigation'
import { usePullToRefresh } from '../lib/usePullToRefresh'
import { useScrollActivity } from '../lib/useScrollActivity'
import { useSearchTourActions } from '../lib/useSearchTourActions'
import { ContinueListeningButton } from './ContinueListeningButton'
import { DynamicSectionsSlider } from './DynamicSectionsSlider'
import { ListenSearchHeader } from './ListenSearchHeader'
import { ListenTopRow } from './ListenTopRow'
import { MyPlaylistsSlider } from './MyPlaylistsSlider'
import { wrapFirstSearchRow, wrapSearchGroupHeader, wrapSearchPicker } from './searchResultTargets'

const OPEN_SEARCH_ACTION_ID = 'open-listen-search'

export const ListenScreen = () => {
  const insets = useSafeAreaInsets()
  const { currentTheme } = useTheme()
  const isSearchOpen = useIsSearchOpen()
  const isSearchActive = useIsSearchActive()
  const openSearch = useOpenSearch()
  useSearchUrlSync()
  useTourActionRegistrar(OPEN_SEARCH_ACTION_ID, openSearch)
  const [tabBarHeight] = useAtom(tabBarHeightAtom)
  const [authStatus] = useAtom(authStatusAtom)
  const [authUser] = useAtom(authUserAtom)
  const restore = useAction(restoreSession)
  const { onScroll } = useScrollActivity()
  const { modal, openAddToPlaylist } = useAddToPlaylistModal()
  const { modal: sermonPlaybackModal, onSermonPress } = useSermonPlayback({
    pickerWrapper: wrapSearchPicker,
  })
  useSearchTourActions({ onPressFirstSermon: onSermonPress })
  const { isRefreshing, refresh } = usePullToRefresh()
  const { onPlaylistPress, onPreacherPress, onShowAllGroup } = useListenSearchNavigation()
  const tourScrollableRef = useTourScrollable()

  useEffect(() => {
    if (authStatus !== 'idle') return

    void restore()
  }, [authStatus, restore])

  const canOpenAdminPanel = authStatus === 'authenticated' && canAccessAdmin(authUser)
  const showAdminButton = canOpenAdminPanel && !isSearchOpen

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[
        styles.safeArea,
        { backgroundColor: currentTheme.background, paddingTop: insets.top },
      ]}
    >
      {isSearchOpen && <ListenSearchHeader />}
      {isSearchOpen && isSearchActive ? (
        <SearchGroupedResults
          onShowAllGroup={onShowAllGroup}
          pickerWrapper={wrapSearchPicker}
          onPlaylistPress={onPlaylistPress}
          onPreacherPress={onPreacherPress}
          onAddToPlaylist={openAddToPlaylist}
          firstRowWrapper={wrapFirstSearchRow}
          groupHeaderWrapper={wrapSearchGroupHeader}
        />
      ) : (
        <PullToRefresh onRefresh={refresh} refreshing={isRefreshing}>
          <ScrollView
            onScroll={onScroll}
            ref={tourScrollableRef}
            scrollEventThrottle={16}
            keyboardDismissMode='on-drag'
            keyboardShouldPersistTaps='handled'
            style={[styles.scroll, { backgroundColor: currentTheme.background }]}
            refreshControl={createRefreshControl(isRefreshing, refresh, currentTheme.primary)}
            contentContainerStyle={[
              { paddingBottom: tabBarHeight + PLAYER_SIZES.miniPlayerHeight },
            ]}
          >
            {!isSearchOpen && <ListenTopRow showAdminButton={showAdminButton} />}
            <DynamicSectionsSlider
              onboardingTargetId='listen.sections'
              leadingElement={
                !isSearchActive ? (
                  <ContinueListeningButton onboardingTargetId='listen.continue-listening' />
                ) : undefined
              }
            />
            <MyPlaylistsSlider onboardingTargetId='listen.my-playlists' />
          </ScrollView>
        </PullToRefresh>
      )}
      {modal}
      {sermonPlaybackModal}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
})
