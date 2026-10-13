import { useState } from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { INDENTS } from 'shared/ui/theme'
import { type OnboardingStep } from '../lib/scenarios'
import { computeTooltipLayout } from '../lib/tooltipPosition'
import { TOOLTIP_ESTIMATED_HEIGHT } from '../lib/tourHole'
import { type OnboardingTargetRect } from '../model'
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
  height,
  highlightAreas,
  holes,
  isWaitingForTarget,
  isWaitSatisfied,
  onClose,
  onNext,
  onPrev,
  step,
  stepIndex,
  total,
  width,
}: {
  anchorRect: null | OnboardingTargetRect
  height: number
  highlightAreas: boolean
  holes: OnboardingTargetRect[]
  isWaitingForTarget: boolean
  isWaitSatisfied: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  step: OnboardingStep
  stepIndex: number
  total: number
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
    >
      <View style={styles.container}>
        <TourDim width={width} holes={holes} height={height} />
        {highlightAreas
          ? holes.map(rect => <TourAreaHighlight rect={rect} key={`${rect.x}-${rect.y}`} />)
          : null}
        {isWaitingForTarget ? null : (
          <View
            style={[styles.tooltip, { top }]}
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
