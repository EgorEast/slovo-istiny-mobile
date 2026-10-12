import { StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { scheduleOnRN } from 'react-native-worklets'
import { type SeekDirection } from './keyboardTargetGuards'

const EDGE_SEEK_ZONE_WIDTH = 64

// Invisible bonus gesture surface on a screen edge: long-press scrubs like the
// next/prev buttons, quick taps seek in steps. No accessibility props — every
// action stays reachable through the progress bar and transport buttons.
export const EdgeSeekZone = ({
  direction,
  onHoldEnd,
  onHoldStart,
  onTapEdge,
}: {
  direction: SeekDirection
  onHoldEnd: () => void
  onHoldStart: (direction: SeekDirection) => void
  onTapEdge: (direction: SeekDirection) => void
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
    <GestureDetector gesture={gesture}>
      <View style={[styles.zone, direction === 'backward' ? styles.backward : styles.forward]} />
    </GestureDetector>
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
