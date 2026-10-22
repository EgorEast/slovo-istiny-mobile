import { type ComponentRef, forwardRef } from 'react'
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native'
import { hapticLight } from '../../lib/haptics'
import { usePressHaptic } from '../../lib/usePressHaptic'

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
>(
  (
    {
      accessibilityRole,
      disabled,
      hapticDisabled,
      onLongPress,
      onPress,
      onPressIn,
      onPressOut,
      ...props
    },
    ref,
  ) => {
    const pressHaptic = usePressHaptic({
      enabled: !disabled && !hapticDisabled,
      hasLongPress: !!onLongPress,
    })

    return (
      <TouchableOpacity
        {...props}
        ref={ref}
        disabled={disabled}
        accessibilityRole={accessibilityRole ?? 'button'}
        onPressIn={event => {
          pressHaptic.onPressIn()
          onPressIn?.(event)
        }}
        onPressOut={event => {
          pressHaptic.onPressOut()
          onPressOut?.(event)
        }}
        onPress={event => {
          // On Android onPress can arrive BEFORE onPressOut, so a deadline still
          // pending from pressIn would pulse after this release haptic and double
          // the vibration. Settling kills that deadline first and reports whether
          // the early pulse already happened — then we must not repeat it.
          const pulseAlreadyFired = pressHaptic.settlePress()
          if (!disabled && !hapticDisabled && !pulseAlreadyFired) hapticLight()
          onPress?.(event)
        }}
        {...(onLongPress && {
          onLongPress: event => {
            // Long-press is a completed gesture: feedback fires together with the
            // action it confirms (context menu, drag start). Such elements skip the
            // early press haptic, so the tap stays a single end-of-gesture pulse.
            if (!disabled && !hapticDisabled) hapticLight()
            onLongPress?.(event)
          },
        })}
      />
    )
  },
)
TouchableButton.displayName = 'TouchableButton'
