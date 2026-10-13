import { Pressable, StyleSheet, View } from 'react-native'
import { type AudioPlayerData } from 'entities/sermon'
import { hapticLight } from 'shared/lib/haptics'
import { type createStyles } from '../ExpandablePlayer/styles'
import { DetailsOverlay } from './DetailsOverlay'
import { type SeekDirection } from './keyboardTargetGuards'
import { PlayerEdgeSeekZones } from './PlayerEdgeSeekZones'

export const PlayerMiddleArea = ({
  audio,
  insetsTop,
  onCloseDetails,
  onTogglePlay,
  showDetails,
  startSeek,
  stopSeek,
  styles,
  tapSeek,
}: {
  audio: AudioPlayerData
  insetsTop: number
  onCloseDetails: () => void
  onTogglePlay: () => void
  showDetails: boolean
  startSeek: (direction: SeekDirection) => void
  stopSeek: () => void
  styles: ReturnType<typeof createStyles>
  tapSeek: (direction: SeekDirection) => void
}) =>
  showDetails ? (
    <DetailsOverlay audio={audio} styles={styles} insetsTop={insetsTop} onClose={onCloseDetails} />
  ) : (
    <View style={styles.spacer}>
      <Pressable
        tabIndex={-1}
        onPressIn={hapticLight}
        style={StyleSheet.absoluteFill}
        onPress={() => void onTogglePlay()}
      />
      <PlayerEdgeSeekZones tapSeek={tapSeek} stopSeek={stopSeek} startSeek={startSeek} />
    </View>
  )
