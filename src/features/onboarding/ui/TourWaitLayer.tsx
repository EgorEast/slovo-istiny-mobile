import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { INDENTS } from 'shared/ui/theme'
import { type OnboardingStep } from '../lib/scenarios'
import { computeTooltipLayout } from '../lib/tooltipPosition'
import { TOOLTIP_ESTIMATED_HEIGHT } from '../lib/tourHole'
import { type OnboardingTargetRect } from '../model'
import { TourTooltip } from './TourTooltip'

// Non-modal layer for an interactive step whose condition is not met yet. The live
// UI stays fully visible and interactive — the user must perform the real action —
// while the card floats above it. `pointerEvents='none'` lets every touch through
// except the card itself (`pointerEvents='auto'`), so the tour stays cancellable.
export const TourWaitLayer = ({
  bottomInset,
  hole,
  index,
  onClose,
  onNext,
  onPrev,
  step,
  total,
  windowHeight,
}: {
  bottomInset: number
  hole: null | OnboardingTargetRect
  index: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  step: OnboardingStep
  total: number
  windowHeight: number
}) => {
  const [cardHeight, setCardHeight] = useState<null | number>(null)
  const { top } = computeTooltipLayout(
    hole,
    cardHeight ?? TOOLTIP_ESTIMATED_HEIGHT,
    windowHeight,
    bottomInset,
    INDENTS.high,
  )

  return (
    <View pointerEvents='none' style={StyleSheet.absoluteFill}>
      <View
        pointerEvents='auto'
        style={[styles.card, { top }]}
        onLayout={event => setCardHeight(event.nativeEvent.layout.height)}
      >
        <TourTooltip
          step={step}
          index={index}
          total={total}
          onPrev={onPrev}
          onNext={onNext}
          onClose={onClose}
          isWaitSatisfied={false}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    left: INDENTS.high,
    position: 'absolute',
    right: INDENTS.high,
  },
})
