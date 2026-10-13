import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useTheme } from 'shared/ui/theme'
import { type OnboardingTargetRect } from '../model'

const TAP_DIAMETER = 56
const PULSE_MS = 800
const PULSE_COUNT = 3

// A pulsing circle centered on the rect the tour "presses" to navigate. It blinks
// three times (~800ms each), matching the overlay's tap phase duration.
export const TapIndicator = ({ rect }: { rect: OnboardingTargetRect }) => {
  const { currentTheme } = useTheme()
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: PULSE_MS / 2, reduceMotion: ReduceMotion.Never }),
        withTiming(0, { duration: PULSE_MS / 2, reduceMotion: ReduceMotion.Never }),
      ),
      PULSE_COUNT,
      false,
    )
  }, [opacity])

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View
      pointerEvents='none'
      style={[
        styles.circle,
        {
          backgroundColor: currentTheme.primary,
          left: rect.x + rect.width / 2 - TAP_DIAMETER / 2,
          top: rect.y + rect.height / 2 - TAP_DIAMETER / 2,
        },
        animatedStyle,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: TAP_DIAMETER / 2,
    height: TAP_DIAMETER,
    position: 'absolute',
    width: TAP_DIAMETER,
  },
})
