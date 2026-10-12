import { type OnboardingTargetRect } from '../model'

interface TooltipLayout {
  top: number
}

export const computeTooltipLayout = (
  hole: null | OnboardingTargetRect,
  tooltipHeight: number,
  windowHeight: number,
  margin: number,
): TooltipLayout => {
  if (hole === null) return { top: (windowHeight - tooltipHeight) / 2 }

  const above = hole.y - margin - tooltipHeight
  if (above >= margin) return { top: above }

  const below = hole.y + hole.height + margin
  return { top: Math.min(below, windowHeight - tooltipHeight - margin) }
}
