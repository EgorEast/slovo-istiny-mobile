import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { INDENTS, useTheme, withAlpha } from 'shared/ui/theme'
import { type OnboardingStep } from '../lib/scenarios'
import { computeTooltipLayout } from '../lib/tooltipPosition'
import { TOOLTIP_ESTIMATED_HEIGHT } from '../lib/tourHole'
import { type OnboardingTargetRect } from '../model'
import { TourTooltip } from './TourTooltip'

const AREA_BORDER_OPACITY = 0.6
const AREA_BORDER_WIDTH = 1.5
const AREA_FILL_OPACITY = 0.18
const AREA_RADIUS = 12
const AREA_HIGHLIGHT_TEST_ID = 'onboarding-area-highlight'

export interface OnboardingAreaRect {
  id: string
  rect: OnboardingTargetRect
}

// Non-modal layer for a pass-through step (an interactive step whose condition is
// unmet yet, or a step that highlights clickable areas). The live UI stays fully
// visible and interactive — the user performs the real action or watches the
// highlighted areas — while the card floats above it. `pointerEvents='none'` lets
// every touch through except the card itself (`pointerEvents='auto'`), so the tour
// stays cancellable.
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
}) => {
  const { currentTheme } = useTheme()
  const [cardHeight, setCardHeight] = useState<null | number>(null)
  const anchor = areaRects[0]?.rect ?? hole
  const { top } = computeTooltipLayout(
    anchor,
    cardHeight ?? TOOLTIP_ESTIMATED_HEIGHT,
    windowHeight,
    bottomInset,
    INDENTS.high,
  )

  return (
    <View pointerEvents='none' style={StyleSheet.absoluteFill}>
      {areaRects.map(({ id, rect }) => (
        <View
          key={id}
          pointerEvents='none'
          testID={AREA_HIGHLIGHT_TEST_ID}
          style={[
            styles.area,
            {
              backgroundColor: withAlpha(currentTheme.primary, AREA_FILL_OPACITY),
              borderColor: withAlpha(currentTheme.primary, AREA_BORDER_OPACITY),
              height: rect.height,
              left: rect.x,
              top: rect.y,
              width: rect.width,
            },
          ]}
        />
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
  area: {
    borderRadius: AREA_RADIUS,
    borderWidth: AREA_BORDER_WIDTH,
    position: 'absolute',
  },
  card: {
    left: INDENTS.high,
    position: 'absolute',
    right: INDENTS.high,
  },
})
