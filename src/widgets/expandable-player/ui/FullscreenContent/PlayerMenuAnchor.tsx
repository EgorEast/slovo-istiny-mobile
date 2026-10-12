import { Entypo } from '@expo/vector-icons'
import { useCtx } from '@reatom/npm-react'
import { useState } from 'react'
import { View } from 'react-native'
import { type TrackCacheVisualState } from 'entities/offline-cache'
import { currentPlaylistAtom } from 'entities/player'
import { myPlaylistsAtom } from 'entities/playlist'
import { type AudioPlayerData } from 'entities/sermon'
import { IconButton } from 'shared/ui/icon-button'
import { type createStyles } from '../ExpandablePlayer/styles'
import { PlayerMenu } from '../PlayerMenu/PlayerMenu'

interface MenuMembership {
  canRemove: boolean
  playlistId: null | string
}

const EMPTY_MEMBERSHIP: MenuMembership = { canRemove: false, playlistId: null }

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
          removablePlaylistId={membership.playlistId}
          canRemoveFromPlaylist={membership.canRemove}
        />
      )}
    </View>
  )
}
