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

// Non-modal layer for a pass-through step (an interactive step whose condition is
// unmet yet). Two siblings at the root keep the card alive: the effects layer is
// `pointerEvents='none'` (purely visual dim/fills), while the card lives in a
// separate `box-none` wrapper. A `none` root would skip its whole subtree in native
// hit-testing — card included — so the wrapper must be `box-none`: touches on empty
// wrapper area fall through to the app, touches on the `auto` card box hit it.
export const TourWaitLayer = ({
  areaRects = [],
  bottomInset,
  displayIndex,
  displayTotal,
  hole,
  isFirstVisible,
  isLastVisible,
  isWaitSatisfied,
  onClose,
  onNext,
  onPrev,
  step,
  windowHeight,
  windowWidth,
}: {
  areaRects?: Array<{ id: string; rect: OnboardingTargetRect }>
  bottomInset: number
  displayIndex: number
  displayTotal: number
  hole: null | OnboardingTargetRect
  isFirstVisible: boolean
  isLastVisible: boolean
  isWaitSatisfied: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  step: OnboardingStep
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
    <>
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
      </View>

      <View pointerEvents='box-none' style={StyleSheet.absoluteFill}>
        <View
          pointerEvents='auto'
          style={[styles.card, { top }]}
          onLayout={event => setCardHeight(event.nativeEvent.layout.height)}
        >
          <TourTooltip
            step={step}
            onPrev={onPrev}
            onNext={onNext}
            onClose={onClose}
            displayIndex={displayIndex}
            displayTotal={displayTotal}
            isLastVisible={isLastVisible}
            isFirstVisible={isFirstVisible}
            isWaitSatisfied={isWaitSatisfied}
          />
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    left: INDENTS.high,
    position: 'absolute',
    right: INDENTS.high,
  },
})
