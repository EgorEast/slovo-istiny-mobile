import { useAction, useAtom } from '@reatom/npm-react'
import { useEffect, useState } from 'react'
import { Modal, StyleSheet, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { INDENTS } from 'shared/ui/theme'
import { scenariosById } from '../lib/scenarios'
import { resolveTourHole } from '../lib/tourHole'
import { useStepNavigation } from '../lib/useStepNavigation'
import {
  endOnboardingTour,
  goToNextOnboardingStep,
  goToPrevOnboardingStep,
  onboardingTargetRectsAtom,
  onboardingTourAtom,
} from '../model'
import { TapIndicator } from './TapIndicator'
import { TourDim } from './TourDim'
import { TourTooltip } from './TourTooltip'

const MISSING_TARGET_TIMEOUT_MS = 1200

export const OnboardingTourOverlay = () => {
  const [tour] = useAtom(onboardingTourAtom)
  const [rects] = useAtom(onboardingTargetRectsAtom)
  const end = useAction(endOnboardingTour)
  const next = useAction(goToNextOnboardingStep)
  const prev = useAction(goToPrevOnboardingStep)
  const { height, width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [expiredStepKey, setExpiredStepKey] = useState<null | string>(null)
  const [cardHeight, setCardHeight] = useState<null | number>(null)

  const scenarioId = tour?.scenarioId
  const stepIndex = tour?.stepIndex
  const stepKey = `${scenarioId ?? ''}:${stepIndex ?? ''}`
  const scenario = scenarioId === undefined ? undefined : scenariosById[scenarioId]
  const step =
    scenario === undefined || stepIndex === undefined ? undefined : scenario.steps[stepIndex]
  const activeTargetId = step?.targetId
  const { holdNavigation, isNavigatingToStep, isWaitSatisfied, tapRect } = useStepNavigation({
    bottomInset: insets.bottom,
    isTourActive: tour !== null,
    scenario,
    step,
    stepIndex,
    stepKey,
    viewportHeight: height,
  })

  useEffect(() => {
    if (activeTargetId === undefined) return

    const timer = setTimeout(() => setExpiredStepKey(stepKey), MISSING_TARGET_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [activeTargetId, stepKey])

  useEffect(() => {
    if (tour) return

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect -- reset stale per-tour UI state when the tour ends
    setExpiredStepKey(null)
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- reset stale per-tour UI state when the tour ends
    setCardHeight(null)
  }, [tour])

  if (tour === null || scenario === undefined || step === undefined) return null

  // Hide the overlay while the router plays the real transition to the step's route.
  if (isNavigatingToStep) return null

  const isLastStep = tour.stepIndex === scenario.steps.length - 1
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
      onRequestClose={end}
      navigationBarTranslucent
    >
      <View style={styles.container}>
        {holdNavigation && tapRect !== undefined ? (
          <TapIndicator rect={tapRect} />
        ) : (
          <>
            <TourDim width={width} height={height} hole={visibleHole} />
            {isWaitingForTarget ? null : (
              <View
                style={[styles.tooltip, { top: tooltipTop }]}
                onLayout={event => setCardHeight(event.nativeEvent.layout.height)}
              >
                <TourTooltip
                  step={step}
                  onClose={end}
                  onPrev={prev}
                  index={tour.stepIndex}
                  total={scenario.steps.length}
                  onNext={isLastStep ? end : next}
                  isWaitSatisfied={isWaitSatisfied}
                />
              </View>
            )}
          </>
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
