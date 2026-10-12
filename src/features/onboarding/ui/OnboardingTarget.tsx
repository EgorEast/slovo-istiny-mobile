import { type PropsWithChildren, useCallback, useRef } from 'react'
import { type StyleProp, View, type ViewStyle } from 'react-native'
import { useTargetMeasure } from '../lib/useTargetMeasure'

// The measuring half lives in its own component so the hook is only mounted when
// there is a target id. An `id`-less OnboardingTarget renders children bare — no
// wrapper View, no navigation subscription, no measurement effects.
const MeasuredTarget = ({
  children,
  id,
  style,
}: PropsWithChildren<{ id: string; style?: StyleProp<ViewStyle> }>) => {
  const ref = useRef<View>(null)
  const getNode = useCallback(() => ref.current, [])
  const { isActive, measure } = useTargetMeasure({ getNode, id })

  return (
    <View ref={ref} style={style} collapsable={false} onLayout={isActive ? measure : undefined}>
      {children}
    </View>
  )
}

export const OnboardingTarget = ({
  children,
  id,
  style,
}: PropsWithChildren<{ id?: string; style?: StyleProp<ViewStyle> }>) => {
  if (id === undefined) return <>{children}</>

  return (
    <MeasuredTarget id={id} style={style}>
      {children}
    </MeasuredTarget>
  )
}
