import { type OnboardingTargetRect } from '../model'

interface TourScrollable {
  scrollTo: (y: number, animated: boolean) => void
}

// Single-tour app: one main scrollable per screen registers itself while mounted,
// and the measuring target pulls it imperatively to bring an off-screen goal into
// view. Module-level mutable handle is the established cross-component pattern here.
let scrollable: null | TourScrollable = null

export const registerTourScrollable = (next: TourScrollable) => {
  scrollable = next
}

export const unregisterTourScrollable = () => {
  scrollable = null
}

export const getTourScrollable = () => scrollable

export const isBelowFold = (
  rect: OnboardingTargetRect,
  viewportHeight: number,
  bottomInset: number,
) => rect.y + rect.height > viewportHeight - bottomInset

export const scrollOffsetFor = (rect: OnboardingTargetRect, viewportHeight: number) =>
  Math.max(0, rect.y - viewportHeight / 2 + rect.height / 2)
