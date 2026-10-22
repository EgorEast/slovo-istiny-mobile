import { forwardRef } from 'react'
import { Pressable, type PressableProps, type ViewInstance } from 'react-native'
import { hapticLight } from '../../lib/haptics'
import { usePressHaptic } from '../../lib/usePressHaptic'

// On web react-native-web only renders a real <button> (Vimium hints and
// browser semantics depend on it) when accessibilityRole='button' is passed
// explicitly, so defaulting it here keeps interactive controls hintable
// without spelling the role at every call site.
export interface PressableButtonProps extends Omit<PressableProps, 'accessibilityRole'> {
  accessibilityRole?: PressableProps['accessibilityRole']
}

export const PressableButton = forwardRef<ViewInstance, PressableButtonProps>(
  (
    {
      accessibilityRole,
      disabled,
      onLongPress,
      onPress,
      onPressIn,
      onPressOut,
      onTouchMove,
      ...props
    },
    ref,
  ) => {
    const pressHaptic = usePressHaptic({ enabled: !disabled, hasLongPress: !!onLongPress })

    return (
      <Pressable
        {...props}
        ref={ref}
        disabled={disabled}
        accessibilityRole={accessibilityRole ?? 'button'}
        onPressOut={event => {
          pressHaptic.onPressOut()
          onPressOut?.(event)
        }}
        onPressIn={event => {
          pressHaptic.onPressIn(event)
          onPressIn?.(event)
        }}
        onTouchMove={event => {
          pressHaptic.onTouchMove(event)
          onTouchMove?.(event)
        }}
        onPress={event => {
          // On Android onPress can arrive BEFORE onPressOut, so a deadline still
          // pending from pressIn would pulse after this release haptic and double
          // the vibration. Settling kills that deadline first and reports whether
          // the early pulse already happened — then we must not repeat it.
          const pulseAlreadyFired = pressHaptic.settlePress()
          if (!disabled && !pulseAlreadyFired) hapticLight()
          onPress?.(event)
        }}
        {...(onLongPress && {
          onLongPress: event => {
            // Long-press is a completed gesture: feedback fires together with the
            // action it confirms (context menu, drag start). Such elements skip the
            // early press haptic, so the tap stays a single end-of-gesture pulse.
            if (!disabled) hapticLight()
            onLongPress?.(event)
          },
        })}
      />
    )
  },
)
PressableButton.displayName = 'PressableButton'
