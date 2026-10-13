import { useState } from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { INDENTS } from 'shared/ui/theme'
import { type OnboardingStep } from '../lib/scenarios'
import { resolveTourHole } from '../lib/tourHole'
import { type OnboardingTargetRect } from '../model'
import { TourDim } from './TourDim'
import { TourTooltip } from './TourTooltip'

// The spotlight phase: a modal dim with a hole over the active target and the step
// card next to it. Kept in its own component so the overlay stays a thin dispatcher
// between the tap/wait pass-through layers and this modal.
export const TourSpotlight = ({
  activeTargetId,
  expiredStepKey,
  height,
  isWaitSatisfied,
  onClose,
  onNext,
  onPrev,
  rects,
  step,
  stepIndex,
  stepKey,
  total,
  width,
}: {
  activeTargetId: string | undefined
  expiredStepKey: null | string
  height: number
  isWaitSatisfied: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  rects: Record<string, OnboardingTargetRect>
  step: OnboardingStep
  stepIndex: number
  stepKey: string
  total: number
  width: number
}) => {
  const insets = useSafeAreaInsets()
  const [cardHeight, setCardHeight] = useState<null | number>(null)
  const { isWaitingForTarget, tooltipTop, visibleHole } = resolveTourHole({
    activeTargetId,
    bottomInset: insets.bottom,
    cardHeight,
    expiredStepKey,
    height,
    rects,
    stepKey,
  })

  return (
    <Modal
      visible
      transparent
      animationType='fade'
      statusBarTranslucent
      onRequestClose={onClose}
      navigationBarTranslucent
    >
      <View style={styles.container}>
        <TourDim width={width} height={height} hole={visibleHole} />
        {isWaitingForTarget ? null : (
          <View
            style={[styles.tooltip, { top: tooltipTop }]}
            onLayout={event => setCardHeight(event.nativeEvent.layout.height)}
          >
            <TourTooltip
              step={step}
              total={total}
              onPrev={onPrev}
              onNext={onNext}
              onClose={onClose}
              index={stepIndex}
              isWaitSatisfied={isWaitSatisfied}
            />
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tooltip: {
    left: INDENTS.high,
    position: 'absolute',
    right: INDENTS.high,
  },
})
