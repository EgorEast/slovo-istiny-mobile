import { type ComponentRef, forwardRef } from 'react'
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native'
import { hapticLight } from '../../lib/haptics'

// On web react-native-web only renders a real <button> (Vimium hints and
// browser semantics depend on it) when accessibilityRole='button' is passed
// explicitly, so defaulting it here keeps TouchableOpacity-based controls
// hintable without spelling the role at every call site.
interface TouchableButtonProps extends Omit<TouchableOpacityProps, 'accessibilityRole'> {
  accessibilityRole?: TouchableOpacityProps['accessibilityRole']
  /** Skips the built-in press haptics (for already-selected tabs). */
  hapticDisabled?: boolean
}

export const TouchableButton = forwardRef<
  ComponentRef<typeof TouchableOpacity>,
  TouchableButtonProps
>(({ accessibilityRole, disabled, hapticDisabled, onLongPress, onPress, ...props }, ref) => (
  <TouchableOpacity
    {...props}
    ref={ref}
    disabled={disabled}
    accessibilityRole={accessibilityRole ?? 'button'}
    onLongPress={event => {
      // Long-press is a completed gesture too: feedback fires together with
      // the action it confirms (context menu, drag start), same rule as the
      // tap haptic above.
      if (!disabled && !hapticDisabled) hapticLight()
      onLongPress?.(event)
    }}
    onPress={event => {
      // Haptic on the completed tap only: onPressIn already fired before a
      // scroll/swipe claims the gesture, so press-down feedback vibrated on
      // every drag started from an interactive element.
      if (!disabled && !hapticDisabled) hapticLight()
      onPress?.(event)
    }}
  />
))
TouchableButton.displayName = 'TouchableButton'
