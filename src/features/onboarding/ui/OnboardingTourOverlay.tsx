import { useAction, useAtom } from '@reatom/npm-react'
import { usePathname, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Modal, StyleSheet, useWindowDimensions, View } from 'react-native'
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
  const router = useRouter()
  const pathname = usePathname()
  const [expiredStepKey, setExpiredStepKey] = useState<null | string>(null)

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

  if (!tour) return null

  const scenario = scenariosById[tour.scenarioId]
  const step = scenario.steps[tour.stepIndex]
  const hole = activeTargetId === undefined ? null : (rects[activeTargetId] ?? null)
  const isTargetWaitExpired = expiredStepKey === stepKey
  const isWaitingForTarget = activeTargetId !== undefined && hole === null && !isTargetWaitExpired
  const layout = computeTooltipLayout(hole, TOOLTIP_ESTIMATED_HEIGHT, height, INDENTS.high)

  return (
    <Modal visible transparent animationType='fade' statusBarTranslucent onRequestClose={end}>
      <View style={styles.container}>
        <TourDim hole={hole} width={width} height={height} />
        {isWaitingForTarget ? null : (
          <View style={[styles.tooltip, { top: layout.top }]}>
            <TourTooltip
              step={step}
              onClose={end}
              onNext={next}
              onPrev={prev}
              index={tour.stepIndex}
              total={scenario.steps.length}
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
