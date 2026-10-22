import { forwardRef } from 'react'
import { Pressable, type PressableProps, type ViewInstance } from 'react-native'
import { hapticLight } from '../../lib/haptics'

// On web react-native-web only renders a real <button> (Vimium hints and
// browser semantics depend on it) when accessibilityRole='button' is passed
// explicitly, so defaulting it here keeps interactive controls hintable
// without spelling the role at every call site.
export interface PressableButtonProps extends Omit<PressableProps, 'accessibilityRole'> {
  accessibilityRole?: PressableProps['accessibilityRole']
}

export const PressableButton = forwardRef<ViewInstance, PressableButtonProps>(
  ({ accessibilityRole, disabled, onLongPress, onPress, ...props }, ref) => (
    <Pressable
      {...props}
      ref={ref}
      disabled={disabled}
      accessibilityRole={accessibilityRole ?? 'button'}
      onLongPress={event => {
        // Long-press is a completed gesture too: feedback fires together with
        // the action it confirms (context menu, drag start), same rule as the
        // tap haptic above.
        if (!disabled) hapticLight()
        onLongPress?.(event)
      }}
      onPress={event => {
        // Haptic on the completed tap only: onPressIn already fired before a
        // scroll/swipe claims the gesture, so press-down feedback vibrated on
        // every drag started from an interactive element.
        if (!disabled) hapticLight()
        onPress?.(event)
      }}
    />
  ),
)
PressableButton.displayName = 'PressableButton'
