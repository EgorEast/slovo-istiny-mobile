import { StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { scheduleOnRN } from 'react-native-worklets'
import { OnboardingTarget } from 'features/onboarding'
import { type SeekDirection } from './keyboardTargetGuards'

const EDGE_SEEK_ZONE_WIDTH = 64

// Invisible bonus gesture surface on a screen edge: long-press scrubs like the
// next/prev buttons, quick taps seek in steps. No accessibility props — every
// action stays reachable through the progress bar and transport buttons.
//
// The zone is absolutely positioned, so the onboarding wrapper carries the
// positioning style itself (`OnboardingTarget` renders the root View) and the
// gesture detector fills it — a static wrapper around the absolute zone would
// collapse its height to zero.
export const EdgeSeekZone = ({
  direction,
  onHoldEnd,
  onHoldStart,
  onTapEdge,
  targetId,
}: {
  direction: SeekDirection
  onHoldEnd: () => void
  onHoldStart: (direction: SeekDirection) => void
  onTapEdge: (direction: SeekDirection) => void
  targetId: string
}) => {
  const gesture = Gesture.Exclusive(
    Gesture.LongPress()
      .onStart(() => {
        'worklet'
        scheduleOnRN(onHoldStart, direction)
      })
      .onFinalize(() => {
        'worklet'
        scheduleOnRN(onHoldEnd)
      }),
    Gesture.Tap().onEnd(() => {
      'worklet'
      scheduleOnRN(onTapEdge, direction)
    }),
  )

  return (
    <OnboardingTarget
      id={targetId}
      style={[styles.zone, direction === 'backward' ? styles.backward : styles.forward]}
    >
      <GestureDetector gesture={gesture}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>
    </OnboardingTarget>
  )
}

const styles = StyleSheet.create({
  backward: {
    left: 0,
  },

  forward: {
    right: 0,
  },

  zone: {
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: EDGE_SEEK_ZONE_WIDTH,
  },
})
