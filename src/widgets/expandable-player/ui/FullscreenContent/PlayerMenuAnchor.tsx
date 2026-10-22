import { useCtx } from '@reatom/npm-react'
import { useState } from 'react'
import { View } from 'react-native'
import { useContinuePlayback } from 'features/continue-playback'
import { type TrackCacheVisualState } from 'entities/offline-cache'
import { currentPlaylistAtom, resetPlaybackAction } from 'entities/player'
import { myPlaylistsAtom, togglePlaylistSermon, useFavoriteSermon } from 'entities/playlist'
import { type AudioPlayerData } from 'entities/sermon'
import { ConfirmDialog } from 'shared/ui/confirm-dialog'
import { COLORS } from 'shared/ui/theme'
import { type createStyles } from '../ExpandablePlayer/styles'
import { PlayerMenu } from '../PlayerMenu/PlayerMenu'
import { PlayerMenuButtons } from './PlayerMenuButtons'

interface MenuMembership {
  canRemove: boolean
  playlistId: null | string
}

const EMPTY_MEMBERSHIP: MenuMembership = { canRemove: false, playlistId: null }

const REMOVE_TITLE = 'Удалить из плейлиста?'
const REMOVE_MESSAGE =
  'Проповедь будет удалена из текущего плейлиста. Выберите, где продолжить прослушивание.'
const REMOVE_CONFIRM_TEXT = 'Удалить'
const CANCEL_TEXT = 'Отмена'

// The ⋮ anchor with the popover menu mounted right under it.
export const PlayerMenuAnchor = ({
  audio,
  isCached,
  onAddToPlaylist,
  onboardingTargetId,
  onOpenMenu,
  onOpenSoundSettings,
  onShowDetails,
  onToggleCache,
  setShowMenu,
  showMenu,
  styles,
  visualState,
}: {
  audio: AudioPlayerData
  isCached?: boolean
  onAddToPlaylist?: (sermon: AudioPlayerData) => void
  onboardingTargetId?: string
  onOpenMenu: () => void
  onOpenSoundSettings: () => void
  onShowDetails: () => void
  onToggleCache: () => void
  setShowMenu: (show: boolean) => void
  showMenu: boolean
  styles: ReturnType<typeof createStyles>
  visualState: TrackCacheVisualState
}) => {
  const ctx = useCtx()
  const { dialog, offer } = useContinuePlayback()
  const { isFavorite, toggleFavorite } = useFavoriteSermon(audio)
  const [membership, setMembership] = useState<MenuMembership>(EMPTY_MEMBERSHIP)
  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false)

  // Снапшот на клик открытия меню — без подписок и пересчёта на каждый рендер
  // (аналогично initialValues в useMembershipDraft).
  const handleOpenMenu = () => {
    const playlist = ctx.get(currentPlaylistAtom)
    const isLocalPlaylist =
      playlist !== null && ctx.get(myPlaylistsAtom).some(item => item.id === playlist.id)
    const containsAudio =
      playlist !== null && playlist.sermons.some(sermon => sermon.id === audio.id)

    setMembership({ canRemove: isLocalPlaylist && containsAudio, playlistId: playlist?.id ?? null })
    onOpenMenu()
  }

  // Диалог живёт в якоре, а не в меню: при закрытии меню его поддерево
  // размонтируется, а подтверждение должно пережить этот шаг.
  const confirmRemove = () => {
    setRemoveDialogOpen(false)
    const { canRemove, playlistId } = membership
    setMembership(EMPTY_MEMBERSHIP)
    if (!canRemove || playlistId === null) return
    void togglePlaylistSermon(ctx, playlistId, audio, false, { suppressPlayerReset: true })
    void offer(audio, playlistId, () => void resetPlaybackAction(ctx))
  }

  return (
    <View style={styles.menuContainer}>
      <PlayerMenuButtons
        audio={audio}
        styles={styles}
        isFavorite={isFavorite}
        onOpenMenu={handleOpenMenu}
        onToggleFavorite={toggleFavorite}
        onAddToPlaylist={onAddToPlaylist}
        onboardingTargetId={onboardingTargetId}
      />
      {showMenu && (
        <PlayerMenu
          isCached={isCached}
          visualState={visualState}
          onToggleCache={onToggleCache}
          onShowDetails={onShowDetails}
          onClose={() => setShowMenu(false)}
          onOpenSoundSettings={onOpenSoundSettings}
          canRemoveFromPlaylist={membership.canRemove}
          onRequestRemoveFromPlaylist={() => setRemoveDialogOpen(true)}
        />
      )}
      <ConfirmDialog
        title={REMOVE_TITLE}
        message={REMOVE_MESSAGE}
        cancelText={CANCEL_TEXT}
        onConfirm={confirmRemove}
        confirmColor={COLORS.error}
        visible={isRemoveDialogOpen}
        confirmText={REMOVE_CONFIRM_TEXT}
        onCancel={() => setRemoveDialogOpen(false)}
      />
      {dialog}
    </View>
  )
}
