import { useAction, useAtom } from '@reatom/npm-react'
import { useEffect, useState } from 'react'
import { Modal, StyleSheet, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { INDENTS } from 'shared/ui/theme'
import { scenariosById } from '../lib/scenarios'
import { computeTooltipLayout } from '../lib/tooltipPosition'
import { useStepRouteNavigation } from '../lib/useStepRouteNavigation'
import {
  endOnboardingTour,
  goToNextOnboardingStep,
  goToPrevOnboardingStep,
  onboardingTargetRectsAtom,
  onboardingTourAtom,
} from '../model'
import { TourDim } from './TourDim'
import { TourTooltip } from './TourTooltip'

const TOOLTIP_ESTIMATED_HEIGHT = 230
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
  const { effectiveRoute, pathname } = useStepRouteNavigation(scenario, stepIndex)

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

  // While the router moves to the step's effective route, hide the whole overlay:
  // the user watches the real tab/stack transition, and the overlay reappears once
  // `pathname` catches up.
  if (effectiveRoute !== undefined && pathname !== effectiveRoute) return null

  const isLastStep = tour.stepIndex === scenario.steps.length - 1
  const hole = activeTargetId === undefined ? null : (rects[activeTargetId] ?? null)
  // A registered rect can sit entirely outside the viewport (a target scrolled
  // out of view). Render it as if it were missing: no hole, centered card — but
  // keep `hole` for the waiting logic so a real registration is not "pending".
  const isRectOutsideViewport = hole !== null && (hole.y >= height || hole.y + hole.height <= 0)
  const visibleHole = isRectOutsideViewport ? null : hole
  const isTargetWaitExpired = expiredStepKey === stepKey
  const isWaitingForTarget = activeTargetId !== undefined && hole === null && !isTargetWaitExpired
  const layout = computeTooltipLayout(
    visibleHole,
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
      onRequestClose={end}
      navigationBarTranslucent
    >
      <View style={styles.container}>
        <TourDim width={width} height={height} hole={visibleHole} />
        {isWaitingForTarget ? null : (
          <View
            style={[styles.tooltip, { top: layout.top }]}
            onLayout={event => setCardHeight(event.nativeEvent.layout.height)}
          >
            <TourTooltip
              step={step}
              onClose={end}
              onPrev={prev}
              index={tour.stepIndex}
              total={scenario.steps.length}
              onNext={isLastStep ? end : next}
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
