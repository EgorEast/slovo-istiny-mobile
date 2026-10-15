import { useState } from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { INDENTS } from 'shared/ui/theme'
import { type OnboardingStep } from '../lib/scenarios'
import { computeTooltipLayout } from '../lib/tooltipPosition'
import { TOOLTIP_ESTIMATED_HEIGHT } from '../lib/tourHole'
import { type OnboardingTargetRect } from '../model/targets'
import { TapIndicator } from './TapIndicator'
import { TourAreaHighlight } from './TourAreaHighlight'
import { TourDim } from './TourDim'
import { styles } from './TourSpotlight.styles'
import { TourTooltip } from './TourTooltip'

const MODAL_TEST_ID = 'onboarding-tour-modal'
const TAP_MODAL_TEST_ID = 'onboarding-tap-modal'

// The blocking tour window: a modal dim with one or more holes and the step card next
// to the first hole (centered when there is none). A RN Modal always blocks the app
// beneath — the requested behavior for target and area steps alike: the tour, not
// the app, owns the touch while a step is shown.
//
// When `tapRect` is set the same Modal window shows the blinking tap hint instead of
// the dim and card. Reusing one Modal (rather than swapping to a second one) keeps the
// native window presented across a card → hint handoff: dismissing one Modal and
// presenting another in the same commit drops the new presentation on iOS, which made
// every blink that followed a card invisible.
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
  tapRect,
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
  /** The rect the tour "presses": when set, the window blinks a tap hint instead. */
  tapRect?: OnboardingTargetRect
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
  // A bottom-anchored card (presentOnTop modals) sits below the spotlighted rows
  // instead of next to the hole, so the highlighted list stays visible.
  const isBottomCard = step.presentOnTop === true && step.cardPosition === 'bottom'
  const anchorOffset = isBottomCard ? { bottom: insets.bottom + INDENTS.medium } : { top }

  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
      navigationBarTranslucent
      key={step.presentOnTop === true ? stepKey : undefined}
      animationType={tapRect === undefined ? 'fade' : 'none'}
      testID={tapRect === undefined ? MODAL_TEST_ID : TAP_MODAL_TEST_ID}
    >
      {tapRect !== undefined ? (
        <View pointerEvents='none' style={StyleSheet.absoluteFill}>
          <TapIndicator rect={tapRect} />
        </View>
      ) : (
        <View style={styles.container}>
          <TourDim width={width} holes={holes} height={height} />
          {highlightAreas
            ? holes.map(rect => <TourAreaHighlight rect={rect} key={`${rect.x}-${rect.y}`} />)
            : null}
          {isWaitingForTarget ? null : (
            <View style={[styles.tooltipAnchor, anchorOffset]}>
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
      )}
    </Modal>
  )
}
