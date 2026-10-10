import { useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { useAddToPlaylistModal } from 'features/add-to-playlist'
import { useHistoryProgressMap, useHistorySermonIds } from 'entities/listening-history'
import { FAVORITES_PLAYLIST } from 'entities/playlist'
import { createTracksListStyles } from 'entities/track-list'
import { useTheme } from 'shared/ui/theme'
import { useCollapsingHeader } from '../lib/useCollapsingHeader'
import { useCustomPlaylistImport } from '../lib/useCustomPlaylistImport'
import { usePlaylistActions } from '../lib/usePlaylistActions'
import { usePlaylistById } from '../lib/usePlaylistById'
import { usePlaylistHeader } from '../lib/usePlaylistHeader'
import { usePlaylistPlaybackTarget } from '../lib/usePlaylistPlaybackTarget'
import { usePlaylistPlayerState } from '../lib/usePlaylistPlayerState'
import { PlaylistHeader } from './PlaylistHeader'
import { PlaylistStatusView } from './PlaylistStatusView'
import { PlaylistTrackList } from './PlaylistTrackList'
import { createStyles } from './styles'
import { usePlaylistItemRenderer } from './usePlaylistItemRenderer'
import { buildTracksListData, usePlaylistNavigationOptions } from './usePlaylistNavigationOptions'

const EMPTY_PLAYLIST = { artwork: null, description: '', id: 'default', sermons: [], title: '' }
const FAVORITES_EMPTY_MESSAGE = 'В избранном пока пусто'

export const PlaylistScreen = () => {
  const { currentTheme } = useTheme()
  const params = useLocalSearchParams<{ custom?: string; playlist: string }>()

  useCustomPlaylistImport()

  // A `custom` share link wins over any stale `playlist` param: the import
  // resolves the target id itself and replaces the route. The flag is bare
  // (`?custom&…`), so only its absence means there is no custom link.
  const playlistId = params.custom !== undefined ? '' : (params.playlist ?? '')
  const { isLoading, notFound, playlist: resolvedPlaylist } = usePlaylistById(playlistId)
  const playlist = resolvedPlaylist ?? EMPTY_PLAYLIST

  const { artwork, description, sermons: list = [], title } = playlist

  const progressMap = useHistoryProgressMap()
  const historySermonIds = useHistorySermonIds()
  const { modal, openAddToPlaylist } = useAddToPlaylistModal()
  const { buildMenuActions, handlePressItem, handlePressPlayAll } = usePlaylistActions(
    list,
    playlist,
    historySermonIds,
    progressMap,
    openAddToPlaylist,
  )

  const { cacheTrigger, currentAudio, isPlaying } = usePlaylistPlayerState()

  const { label: playAllLabel, target: playAllTarget } = usePlaylistPlaybackTarget(playlist)

  const { headerImageHeight, imageOpacityStyle, scrollHandler, scrollY, titleAppearThreshold } =
    useCollapsingHeader()

  const { headerIconColor, statusBarStyle } = usePlaylistHeader({
    scrollY,
    title,
    titleAppearThreshold,
  })

  const tracksListData = useMemo(() => buildTracksListData(list, artwork), [list, artwork])

  const renderItem = usePlaylistItemRenderer({
    buildMenuActions,
    cacheTrigger,
    currentAudioId: currentAudio?.id,
    handlePressItem,
    isPlaying,
    progressMap,
  })

  usePlaylistNavigationOptions({ headerIconColor, playlist, title, tracksListData })

  const tracksListStyles = useMemo(() => createTracksListStyles(currentTheme), [currentTheme])

  const styles = useMemo(() => createStyles(currentTheme), [currentTheme])

  const ItemSeparator = useCallback(
    () => <View style={tracksListStyles.divider} />,
    [tracksListStyles],
  )

  if (notFound || isLoading)
    return (
      <PlaylistStatusView
        styles={styles}
        notFound={notFound}
        theme={currentTheme}
        statusBarStyle={statusBarStyle}
      />
    )

  return (
    <View style={styles.container}>
      <StatusBar style={statusBarStyle} />
      <PlaylistTrackList
        data={tracksListData}
        renderItem={renderItem}
        onScroll={scrollHandler}
        style={tracksListStyles.container}
        ItemSeparatorComponent={ItemSeparator}
        emptyMessage={playlist.id === FAVORITES_PLAYLIST.id ? FAVORITES_EMPTY_MESSAGE : undefined}
        headerElement={
          <PlaylistHeader
            title={title}
            artwork={artwork}
            theme={currentTheme}
            description={description}
            playAllLabel={playAllLabel}
            headerImageHeight={headerImageHeight}
            imageOpacityStyle={imageOpacityStyle}
            isPlayAllDisabled={playAllTarget === null}
            onPressPlayAll={() => void handlePressPlayAll(playAllTarget ?? undefined)}
          />
        }
      />
      {modal}
    </View>
  )
}
