import { useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useMemo } from 'react'
import { View } from 'react-native'
import { useHistoryProgressMap, useHistorySermonIds } from 'entities/listening-history'
import { FAVORITES_PLAYLIST } from 'entities/playlist'
import { createTracksListStyles } from 'entities/track-list'
import { useTheme } from 'shared/ui/theme'
import { useCollapsingHeader } from '../lib/useCollapsingHeader'
import { useCustomPlaylistImport } from '../lib/useCustomPlaylistImport'
import { useHydrateMyPlaylists } from '../lib/useHydrateMyPlaylists'
import { usePlaylistAddToPlaylist } from '../lib/usePlaylistAddToPlaylist'
import { usePlaylistById } from '../lib/usePlaylistById'
import { usePlaylistHeader } from '../lib/usePlaylistHeader'
import { usePlaylistPlaybackTarget } from '../lib/usePlaylistPlaybackTarget'
import { usePlaylistPlayerState } from '../lib/usePlaylistPlayerState'
import { usePlaylistTrackActions } from '../lib/usePlaylistTrackActions'
import { PlaylistHeader } from './PlaylistHeader'
import { PlaylistStatusView } from './PlaylistStatusView'
import { PlaylistTrackList } from './PlaylistTrackList'
import { PlaylistTrackSeparator } from './PlaylistTrackSeparator'
import { createStyles } from './styles'
import { usePlaylistItemRenderer } from './usePlaylistItemRenderer'
import { buildTracksListData, usePlaylistNavigationOptions } from './usePlaylistNavigationOptions'

const EMPTY_PLAYLIST = { artwork: null, description: '', id: 'default', sermons: [], title: '' }

export const PlaylistScreen = () => {
  const { currentTheme } = useTheme()
  const params = useLocalSearchParams<{ custom?: string; playlist: string }>()

  useHydrateMyPlaylists()

  const { importedPlaylistId } = useCustomPlaylistImport()

  // A `custom` share link wins over any stale `playlist` param: the import
  // resolves the target id itself and leaves the share params in place (the
  // address bar keeps the shareable link). While it is in flight there is no
  // usable id yet — render the loading state instead of a premature not-found.
  // Once resolved, the id points at the local playlist, which tier 0 builds from
  // the hydrated atom.
  const isImportingCustomPlaylist = params.custom !== undefined && importedPlaylistId === null
  const playlistId =
    importedPlaylistId ?? (isImportingCustomPlaylist ? '' : (params.playlist ?? ''))
  const { isLoading, notFound, playlist: resolvedPlaylist } = usePlaylistById(playlistId)
  const playlist = resolvedPlaylist ?? EMPTY_PLAYLIST

  const { artwork, description, sermons: list = [], title } = playlist

  const progressMap = useHistoryProgressMap()
  const historySermonIds = useHistorySermonIds()
  const { modal, openAddAllToPlaylist, openAddToPlaylist } = usePlaylistAddToPlaylist()
  const { bindRowMenu, buildMenuActions, handlePressItem, handlePressPlayAll, renderDialog } =
    usePlaylistTrackActions(list, playlist, historySermonIds, progressMap, openAddToPlaylist)

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
    bindRowMenu,
    buildMenuActions,
    cacheTrigger,
    currentAudioId: currentAudio?.id,
    handlePressItem,
    isPlaying,
    progressMap,
  })

  usePlaylistNavigationOptions({
    headerIconColor,
    onAddAllToPlaylist: openAddAllToPlaylist,
    playlist,
    title,
    tracksListData,
  })

  const tracksListStyles = useMemo(() => createTracksListStyles(currentTheme), [currentTheme])
  const styles = useMemo(() => createStyles(currentTheme), [currentTheme])

  if (isImportingCustomPlaylist || isLoading || notFound)
    return (
      <PlaylistStatusView
        styles={styles}
        theme={currentTheme}
        statusBarStyle={statusBarStyle}
        notFound={!isImportingCustomPlaylist && notFound}
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
        ItemSeparatorComponent={PlaylistTrackSeparator}
        emptyMessage={playlist.id === FAVORITES_PLAYLIST.id ? 'В избранном пока пусто' : undefined}
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
      {renderDialog()}
    </View>
  )
}
