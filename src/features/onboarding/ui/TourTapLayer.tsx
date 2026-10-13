import { StyleSheet, View } from 'react-native'
import { type OnboardingTargetRect } from '../model'
import { TapIndicator } from './TapIndicator'

// Non-modal layer: paints the pulsing circle above the live UI while every touch
// passes through to the real control underneath (the tour "records" the tap). The
// circle is purely visual — `pointerEvents='none'` keeps the screen interactive.
export const TourTapLayer = ({ rect }: { rect: OnboardingTargetRect }) => (
  <View pointerEvents='none' style={StyleSheet.absoluteFill}>
    <TapIndicator rect={rect} />
  </View>
)
