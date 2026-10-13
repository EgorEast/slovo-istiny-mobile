import { Entypo } from '@expo/vector-icons'
import { View } from 'react-native'
import { OnboardingTarget } from 'features/onboarding'
import { PlayerRepeatToggle, SermonPlayerControls } from 'entities/player'
import { IconButton } from 'shared/ui/icon-button'
import { type createStyles } from '../ExpandablePlayer/styles'

export const PlayerControlsRow = ({
  onOpenPlaylist,
  startSeek,
  stopSeek,
  styles,
}: {
  onOpenPlaylist: () => void
  startSeek: (direction: 'backward' | 'forward') => void
  stopSeek: () => void
  styles: ReturnType<typeof createStyles>
}) => (
  <View style={styles.controlsRow}>
    <OnboardingTarget id='player-fullscreen.repeat'>
      <PlayerRepeatToggle style={styles.sideControl} />
    </OnboardingTarget>
    <OnboardingTarget id='player-fullscreen.controls'>
      <SermonPlayerControls
        variant='fullscreen'
        onPressOutSeek={stopSeek}
        onLongPressSeek={startSeek}
      />
    </OnboardingTarget>
    <OnboardingTarget id='player-fullscreen.playlist'>
      <IconButton
        onPress={onOpenPlaylist}
        style={styles.sideControl}
        accessibilityLabel='Открыть плейлист'
        Icon={<Entypo name='list' style={styles.controlIcon} />}
      />
    </OnboardingTarget>
  </View>
)
