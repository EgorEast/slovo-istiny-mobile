import { type OnboardingTargetRect } from '../model'

interface TooltipLayout {
  top: number
}

export const computeTooltipLayout = (
  hole: null | OnboardingTargetRect,
  tooltipHeight: number,
  windowHeight: number,
  bottomInset: number,
  margin: number,
): TooltipLayout => {
  if (hole === null) return { top: (windowHeight - bottomInset - tooltipHeight) / 2 }

  const above = hole.y - margin - tooltipHeight
  if (above >= margin) return { top: above }

  const below = hole.y + hole.height + margin
  const maxTop = windowHeight - bottomInset - tooltipHeight - margin
  return { top: Math.max(margin, Math.min(below, maxTop)) }
}
