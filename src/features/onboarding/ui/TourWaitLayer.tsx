import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { APP_MAX_CONTENT_WIDTH } from 'shared/ui/layout'
import { INDENTS } from 'shared/ui/theme'
import { type OnboardingStep } from '../lib/scenarios'
import { computeTooltipLayout } from '../lib/tooltipPosition'
import { type AreaRect, TOOLTIP_ESTIMATED_HEIGHT } from '../lib/tourHole'
import { type OnboardingTargetRect } from '../model/targets'
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
  areaRects?: AreaRect[]
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
  // An interactive step marks its zones with the pass-through fills only: dimming
  // the live UI the user still has to act on would fight the step's purpose.
  const showDim = isAreaStep && step.interactive !== true

  return (
    <>
      <View pointerEvents='none' style={StyleSheet.absoluteFill}>
        {showDim ? (
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
        <View pointerEvents='box-none' style={[styles.cardAnchor, { top }]}>
          <View
            style={styles.card}
            pointerEvents='auto'
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
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    // Desktop-web: cap the card to the shared centered column (undefined on native,
    // so phones keep the full width between the margins).
    alignSelf: 'center',
    maxWidth: APP_MAX_CONTENT_WIDTH,
    width: '100%',
  },
  cardAnchor: {
    left: INDENTS.high,
    position: 'absolute',
    right: INDENTS.high,
  },
})
