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
  const maxTop = windowHeight - bottomInset - tooltipHeight - margin
  const clampToViewport = (top: number) => Math.max(margin, Math.min(top, maxTop))

  if (hole === null) {
    const centered = (windowHeight - bottomInset - tooltipHeight) / 2
    return { top: clampToViewport(centered) }
  }

  const above = hole.y - margin - tooltipHeight
  if (above >= margin) return { top: clampToViewport(above) }

  const below = hole.y + hole.height + margin
  return { top: clampToViewport(below) }
}
