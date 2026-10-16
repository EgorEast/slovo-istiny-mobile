import { useAtom } from '@reatom/npm-react'
import { useNavigation } from 'expo-router'
import { useLayoutEffect } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useAddToPlaylistModal } from 'features/add-to-playlist'
import { useOfflineSermons } from 'features/offline-sermons'
import { OnboardingHelpRow, OnboardingTarget, useTourScrollable } from 'features/onboarding'
import { sermonCachingEnabledAtom } from 'entities/offline-cache'
import { isPlayingAtom } from 'entities/player'
import { createTracksListStyles, TracksListSkeleton } from 'entities/track-list'
import { tabBarHeightAtom } from 'shared/ui/layout'
import { INDENTS, PLAYER_SIZES, useTheme } from 'shared/ui/theme'
import { OfflineEmptyState } from './OfflineEmptyState'
import { OfflineHeaderMenu } from './OfflineHeaderMenu'
import { OfflineRow } from './OfflineRow'
import { OfflineSeparator } from './OfflineSeparator'
import { SermonCachingHeaderSwitch } from './SermonCachingHeaderSwitch'

// Cap the rows mounted on first paint and per batch: every mounted row runs its
// own cache/history subscriptions and a native file-system check, so a large
// default window (21 viewports) makes the list land in one expensive wave.
const INITIAL_ROWS_TO_RENDER = 8
const ROWS_PER_BATCH = 8
const LIST_WINDOW_SIZE = 7

const styles = StyleSheet.create({
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: INDENTS.lowest,
  },
  skeletonList: {
    paddingTop: INDENTS.low,
  },
  skeletonRow: {
    marginHorizontal: INDENTS.medium,
  },
})

export const OfflineScreen = () => {
  const { currentTheme } = useTheme()
  const navigation = useNavigation()
  const { isLoading, items } = useOfflineSermons()
  const [isPlaying] = useAtom(isPlayingAtom)
  const [isCachingEnabled] = useAtom(sermonCachingEnabledAtom)
  const [tabBarHeight] = useAtom(tabBarHeightAtom)
  const tracksListStyles = createTracksListStyles(currentTheme)
  const { modal, openAddToPlaylist } = useAddToPlaylistModal()
  const tourScrollableRef = useTourScrollable()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <OnboardingHelpRow>
          <View style={styles.headerActions}>
            <SermonCachingHeaderSwitch onboardingTargetId='offline.caching-switch' />
            <OfflineHeaderMenu onboardingTargetId='offline.header-menu' />
          </View>
        </OnboardingHelpRow>
      ),
    })
    return () => {
      navigation.setOptions({ headerRight: undefined })
    }
  }, [navigation])

  if (isLoading && items.length === 0)
    return (
      <View style={tracksListStyles.container}>
        <View style={styles.skeletonList}>
          <TracksListSkeleton rowStyle={styles.skeletonRow} />
        </View>
      </View>
    )

  return (
    <View style={tracksListStyles.container}>
      <OnboardingTarget id='offline.rows' style={{ flex: 1 }}>
        <FlatList
          data={items}
          ref={tourScrollableRef}
          windowSize={LIST_WINDOW_SIZE}
          maxToRenderPerBatch={ROWS_PER_BATCH}
          keyExtractor={item => item.sermon.id}
          ItemSeparatorComponent={OfflineSeparator}
          initialNumToRender={INITIAL_ROWS_TO_RENDER}
          ListEmptyComponent={<OfflineEmptyState isCachingEnabled={isCachingEnabled} />}
          renderItem={({ item }) => (
            <OfflineRow item={item} isPlaying={isPlaying} onAddToPlaylist={openAddToPlaylist} />
          )}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: items.length === 0 ? 'center' : undefined,
            paddingBottom: tabBarHeight + PLAYER_SIZES.miniPlayerHeight + INDENTS.low,
          }}
        />
      </OnboardingTarget>
      {modal}
    </View>
  )
}
