import { useAction, useAtom } from '@reatom/npm-react'
import { usePathname, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Modal, StyleSheet, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { INDENTS } from 'shared/ui/theme'
import { scenariosById } from '../lib/scenarios'
import { computeTooltipLayout } from '../lib/tooltipPosition'
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
  const router = useRouter()
  const pathname = usePathname()
  const [expiredStepKey, setExpiredStepKey] = useState<null | string>(null)
  const [cardHeight, setCardHeight] = useState<null | number>(null)

  const scenarioId = tour?.scenarioId
  const stepIndex = tour?.stepIndex
  const stepKey = `${scenarioId ?? ''}:${stepIndex ?? ''}`
  const activeTargetId =
    scenarioId === undefined || stepIndex === undefined
      ? undefined
      : scenariosById[scenarioId].steps[stepIndex].targetId

  useEffect(() => {
    if (scenarioId === undefined || stepIndex === undefined) return

    const route = scenariosById[scenarioId].steps[stepIndex].route
    if (route && pathname !== route) router.push(route)
  }, [scenarioId, stepIndex, pathname, router])

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

  if (!tour) return null

  const scenario = scenariosById[tour.scenarioId]
  const step = scenario.steps[tour.stepIndex]
  const isLastStep = tour.stepIndex === scenario.steps.length - 1
  const hole = activeTargetId === undefined ? null : (rects[activeTargetId] ?? null)
  const isTargetWaitExpired = expiredStepKey === stepKey
  const isWaitingForTarget = activeTargetId !== undefined && hole === null && !isTargetWaitExpired
  const layout = computeTooltipLayout(
    hole,
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
        <TourDim hole={hole} width={width} height={height} />
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
