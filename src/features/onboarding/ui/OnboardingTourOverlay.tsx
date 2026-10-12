import { useAction, useAtom } from '@reatom/npm-react'
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

export const OnboardingTourOverlay = () => {
  const [tour] = useAtom(onboardingTourAtom)
  const [rects] = useAtom(onboardingTargetRectsAtom)
  const end = useAction(endOnboardingTour)
  const next = useAction(goToNextOnboardingStep)
  const prev = useAction(goToPrevOnboardingStep)
  const { height, width } = useWindowDimensions()

  if (!tour) return null

  const scenario = scenariosById[tour.scenarioId]
  const step = scenario.steps[tour.stepIndex]
  const hole = step.targetId === undefined ? null : (rects[step.targetId] ?? null)
  const layout = computeTooltipLayout(hole, TOOLTIP_ESTIMATED_HEIGHT, height, INDENTS.high)

  return (
    <Modal visible transparent animationType='fade' statusBarTranslucent onRequestClose={end}>
      <View style={styles.container}>
        <TourDim hole={hole} width={width} height={height} />
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
