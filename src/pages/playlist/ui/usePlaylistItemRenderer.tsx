import { type ReactElement, useCallback } from 'react'
import { OnboardingTarget } from 'features/onboarding'
import { type MenuActionItem, type TrackListMenuControls } from 'entities/track-list'
import { PlaylistTrackItem } from './PlaylistTrackItem'
import { type TracksListData } from './usePlaylistNavigationOptions'

// Only the first sermon row is highlighted: the row menu is identical for every
// row, so one anchoring target covers the tour's card position.
const FIRST_ROW_TARGET_ID = 'playlist.first-row'
// The offline-cache row of the first row's menu toggles by state: the tour targets
// the «add» id while the sermon is not cached and the «remove» id while it is.
const ROW_MENU_OFFLINE_ADD_TARGET_ID = 'playlist.row-menu-offline-add'
const ROW_MENU_OFFLINE_REMOVE_TARGET_ID = 'playlist.row-menu-offline-remove'
const FIRST_ROW_CACHE_ACTION_TARGET_IDS = {
  add: ROW_MENU_OFFLINE_ADD_TARGET_ID,
  remove: ROW_MENU_OFFLINE_REMOVE_TARGET_ID,
}

// Only menu actions carrying an onboarding target id are wrapped; the rest render
// bare, so the tour spotlights just the first row's dropdown items.
const renderMenuRow = (row: ReactElement, item: MenuActionItem) =>
  item.onboardingTargetId === undefined ? (
    row
  ) : (
    <OnboardingTarget id={item.onboardingTargetId}>{row}</OnboardingTarget>
  )

/**
 * Builds the stable FlatList renderer for the playlist's track rows.
 * @param props - Row dependencies from the screen (actions and player state).
 * @param props.bindRowMenu - Hands the first row's dropdown controls to the screen.
 * @param props.buildMenuActions - Builds the per-row context menu, if playable.
 * @param props.cacheTrigger - Offline-cache change counter to re-render rows.
 * @param props.currentAudioId - Id of the currently playing sermon, if any.
 * @param props.handlePressItem - Press handler that plays the row's sermon.
 * @param props.isPlaying - Whether audio is currently playing.
 * @param props.progressMap - Stored listening progress by sermon id (0..1).
 * @returns A memoized row renderer.
 */
export const usePlaylistItemRenderer = ({
  bindRowMenu,
  buildMenuActions,
  cacheTrigger,
  currentAudioId,
  handlePressItem,
  isPlaying,
  progressMap,
}: {
  bindRowMenu: (controls: TrackListMenuControls) => void
  buildMenuActions: (index: number) => MenuActionItem[] | undefined
  cacheTrigger?: number
  currentAudioId?: string
  handlePressItem: (index: number) => void
  isPlaying: boolean
  progressMap: Map<string, number>
}) =>
  useCallback(
    ({ index, item }: { index: number; item: TracksListData[number] }) => {
      const row = (
        <PlaylistTrackItem
          id={item.id}
          index={index}
          title={item.title}
          isPlaying={isPlaying}
          artwork={item.artwork}
          audioUrl={item.audioUrl}
          subtitle={item.subtitle}
          onPress={handlePressItem}
          cacheTrigger={cacheTrigger}
          currentAudioId={currentAudioId}
          menuActions={buildMenuActions(index)}
          storedProgress={progressMap.get(item.id ?? '')}
          bindMenuOpener={index === 0 ? bindRowMenu : undefined}
          renderMenuItem={index === 0 ? renderMenuRow : undefined}
          cacheActionOnboardingTargetIds={
            index === 0 ? FIRST_ROW_CACHE_ACTION_TARGET_IDS : undefined
          }
        />
      )
      if (index !== 0) return row

      return <OnboardingTarget id={FIRST_ROW_TARGET_ID}>{row}</OnboardingTarget>
    },
    [
      bindRowMenu,
      buildMenuActions,
      cacheTrigger,
      currentAudioId,
      handlePressItem,
      isPlaying,
      progressMap,
    ],
  )
