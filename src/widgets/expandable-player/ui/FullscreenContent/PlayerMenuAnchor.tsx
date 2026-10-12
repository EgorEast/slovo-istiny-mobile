import { Entypo } from '@expo/vector-icons'
import { useCtx } from '@reatom/npm-react'
import { useState } from 'react'
import { View } from 'react-native'
import { type TrackCacheVisualState } from 'entities/offline-cache'
import { currentPlaylistAtom } from 'entities/player'
import { myPlaylistsAtom, togglePlaylistSermon } from 'entities/playlist'
import { type AudioPlayerData } from 'entities/sermon'
import { ConfirmDialog } from 'shared/ui/confirm-dialog'
import { IconButton } from 'shared/ui/icon-button'
import { COLORS } from 'shared/ui/theme'
import { type createStyles } from '../ExpandablePlayer/styles'
import { PlayerMenu } from '../PlayerMenu/PlayerMenu'

interface MenuMembership {
  canRemove: boolean
  playlistId: null | string
}

const EMPTY_MEMBERSHIP: MenuMembership = { canRemove: false, playlistId: null }

const REMOVE_TITLE = 'Удалить из плейлиста?'
const REMOVE_MESSAGE = 'Плеер будет закрыт.'
const REMOVE_CONFIRM_TEXT = 'Удалить'
const CANCEL_TEXT = 'Отмена'

// The ⋮ anchor with the popover menu mounted right under it.
export const PlayerMenuAnchor = ({
  audio,
  isCached,
  onAddToPlaylist,
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
    if (membership.playlistId === null) return
    void togglePlaylistSermon(ctx, membership.playlistId, audio, false)
  }

  return (
    <View style={styles.menuContainer}>
      <IconButton
        onPress={handleOpenMenu}
        style={styles.menuButton}
        accessibilityLabel='Меню плеера'
        Icon={<Entypo style={styles.menuIcon} name='dots-three-vertical' />}
      />
      {showMenu && (
        <PlayerMenu
          audio={audio}
          isCached={isCached}
          visualState={visualState}
          onToggleCache={onToggleCache}
          onShowDetails={onShowDetails}
          onAddToPlaylist={onAddToPlaylist}
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
    </View>
  )
}
