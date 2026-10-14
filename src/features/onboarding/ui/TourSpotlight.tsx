import { useState } from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { APP_MAX_CONTENT_WIDTH } from 'shared/ui/layout'
import { INDENTS } from 'shared/ui/theme'
import { type OnboardingStep } from '../lib/scenarios'
import { computeTooltipLayout } from '../lib/tooltipPosition'
import { TOOLTIP_ESTIMATED_HEIGHT } from '../lib/tourHole'
import { type OnboardingTargetRect } from '../model/targets'
import { TourAreaHighlight } from './TourAreaHighlight'
import { TourDim } from './TourDim'
import { TourTooltip } from './TourTooltip'

const MODAL_TEST_ID = 'onboarding-tour-modal'

// The spotlight phase: a modal dim with one or more holes and the step card next to
// the first hole (centered when there is none). A RN Modal always blocks the app
// beneath — the requested behavior for target and area steps alike: the tour, not
// the app, owns the touch while a step is shown.
export const TourSpotlight = ({
  anchorRect,
  displayIndex,
  displayTotal,
  height,
  highlightAreas,
  holes,
  isFirstVisible,
  isLastVisible,
  isWaitingForTarget,
  isWaitSatisfied,
  onClose,
  onNext,
  onPrev,
  step,
  stepKey,
  width,
}: {
  anchorRect: null | OnboardingTargetRect
  displayIndex: number
  displayTotal: number
  height: number
  highlightAreas: boolean
  holes: OnboardingTargetRect[]
  isFirstVisible: boolean
  isLastVisible: boolean
  isWaitingForTarget: boolean
  isWaitSatisfied: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  step: OnboardingStep
  stepKey: string
  width: number
}) => {
  const insets = useSafeAreaInsets()
  const [cardHeight, setCardHeight] = useState<null | number>(null)
  const { top } = computeTooltipLayout(
    anchorRect,
    cardHeight ?? TOOLTIP_ESTIMATED_HEIGHT,
    height,
    insets.bottom,
    INDENTS.high,
  )

  return (
    <Modal
      visible
      transparent
      animationType='fade'
      statusBarTranslucent
      testID={MODAL_TEST_ID}
      onRequestClose={onClose}
      navigationBarTranslucent
      key={step.presentOnTop === true ? stepKey : undefined}
    >
      <View style={styles.container}>
        <TourDim width={width} holes={holes} height={height} />
        {highlightAreas
          ? holes.map(rect => <TourAreaHighlight rect={rect} key={`${rect.x}-${rect.y}`} />)
          : null}
        {isWaitingForTarget ? null : (
          <View style={[styles.tooltipAnchor, { top }]}>
            <View
              style={styles.tooltip}
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
    // Desktop-web: cap the card to the shared centered column (undefined on native,
    // so phones keep the full width between the margins).
    alignSelf: 'center',
    maxWidth: APP_MAX_CONTENT_WIDTH,
    width: '100%',
  },
  tooltipAnchor: {
    left: INDENTS.high,
    position: 'absolute',
    right: INDENTS.high,
  },
})
