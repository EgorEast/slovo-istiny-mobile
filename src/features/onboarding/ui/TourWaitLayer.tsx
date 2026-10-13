import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { INDENTS } from 'shared/ui/theme'
import { type OnboardingStep } from '../lib/scenarios'
import { computeTooltipLayout } from '../lib/tooltipPosition'
import { TOOLTIP_ESTIMATED_HEIGHT } from '../lib/tourHole'
import { type OnboardingTargetRect } from '../model'
import { TourAreaHighlight } from './TourAreaHighlight'
import { TourDim } from './TourDim'
import { TourTooltip } from './TourTooltip'

export interface OnboardingAreaRect {
  id: string
  rect: OnboardingTargetRect
}

// Non-modal layer for a pass-through step (an interactive step whose condition is
// unmet yet). The live UI stays fully visible and interactive — the user performs
// the real action — while the card floats above it. `pointerEvents='none'` lets
// every touch through except the card itself (`pointerEvents='auto'`), so the tour
// stays cancellable. Area steps dim the background around their zones, keeping the
// zones themselves bright and tappable.
export const TourWaitLayer = ({
  areaRects = [],
  bottomInset,
  hole,
  index,
  isWaitSatisfied,
  onClose,
  onNext,
  onPrev,
  step,
  total,
  windowHeight,
  windowWidth,
}: {
  areaRects?: OnboardingAreaRect[]
  bottomInset: number
  hole: null | OnboardingTargetRect
  index: number
  isWaitSatisfied: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  step: OnboardingStep
  total: number
  windowHeight: number
  windowWidth: number
}) => {
  const [cardHeight, setCardHeight] = useState<null | number>(null)
  const anchor = areaRects[0]?.rect ?? hole
  const { top } = computeTooltipLayout(
    anchor,
    cardHeight ?? TOOLTIP_ESTIMATED_HEIGHT,
    windowHeight,
    bottomInset,
    INDENTS.high,
  )
  const isAreaStep = step.areaTargetIds !== undefined

  return (
    <View pointerEvents='none' style={StyleSheet.absoluteFill}>
      {isAreaStep ? (
        <TourDim
          width={windowWidth}
          height={windowHeight}
          holes={areaRects.map(({ rect }) => rect)}
        />
      ) : null}
      {areaRects.map(({ id, rect }) => (
        <TourAreaHighlight key={id} rect={rect} />
      ))}
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
          isWaitSatisfied={isWaitSatisfied}
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
