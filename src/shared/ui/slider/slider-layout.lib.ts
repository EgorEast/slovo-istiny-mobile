import { SCREEN_WIDTH } from '../../config/screen-dimensions'
import { INDENTS } from '../theme/themed'
import { SliderItemSize } from './slider-item/slider-item.types'

interface SliderCardLayout {
  cardWidth: number
  stride: number
  visiblePeek: number
}

interface SliderSizeContract {
  fullStrides: number
  peekRatio: number
}

const SLIDER_GAP = INDENTS.middle

// Largest common phone min side. Cards scale with the screen up to this
// reference; on larger screens (tablets/desktop) they keep the exact
// proportions of the biggest phone instead of growing indefinitely.
const MAX_MOBILE_MIN_SIDE = 430

export const MAX_SLIDER_LAYOUT_VIEWPORT = MAX_MOBILE_MIN_SIDE - 2 * SLIDER_GAP

// A viewport measured before layout settles can be narrower than the gaps,
// which would drive the width formula negative; a floor keeps the card
// tappable instead of collapsing it.
const MIN_CARD_WIDTH = 48

const SNAP_EPSILON = 0.5

// How many full strides fit between the two peeks and how much of a card the
// peek shows (as a fraction of the card width).
const SLIDER_SIZE_CONTRACT: Record<SliderItemSize, SliderSizeContract> = {
  [SliderItemSize.Large]: { fullStrides: 1, peekRatio: 0.2 },
  [SliderItemSize.Middle]: { fullStrides: 2, peekRatio: 0.2 },
  [SliderItemSize.Small]: { fullStrides: 3, peekRatio: 0.2 },
  [SliderItemSize.XLarge]: { fullStrides: 1, peekRatio: 0.12 },
}

export const getSliderCardLayout = (
  size: SliderItemSize,
  layoutViewport: number,
): SliderCardLayout => {
  const { fullStrides, peekRatio } = SLIDER_SIZE_CONTRACT[size]
  const viewport = Math.min(layoutViewport, MAX_SLIDER_LAYOUT_VIEWPORT)
  const estimatedWidth = (viewport - (fullStrides + 1) * SLIDER_GAP) / (fullStrides + 2 * peekRatio)
  const cardWidth = Math.max(estimatedWidth, MIN_CARD_WIDTH)

  return {
    cardWidth,
    stride: cardWidth + SLIDER_GAP,
    visiblePeek: peekRatio * cardWidth,
  }
}

export const getSliderLayoutViewport = (measuredWidth?: number): number =>
  Math.min(measuredWidth ?? SCREEN_WIDTH - 2 * SLIDER_GAP, MAX_SLIDER_LAYOUT_VIEWPORT)

export const buildSliderSnapOffsets = ({
  columnCount,
  contentWidth,
  peekInset,
  stride,
  viewportWidth,
}: {
  columnCount: number
  contentWidth: number
  peekInset: number
  stride: number
  viewportWidth: number
}): number[] => {
  const maxOffset = Math.max(contentWidth - viewportWidth, 0)
  if (maxOffset <= 0) return []

  // Every snap position keeps a cut card on the scrolled-to edge:
  // - offset 0 cuts the next card on the right at 2Q + g;
  // - an intermediate k*stride - P cuts both edges at Q;
  // - maxOffset cuts the previous card on the left at 2Q + g.
  const offsets = [0]
  for (let columnIndex = 1; columnIndex < columnCount; columnIndex += 1) {
    const offset = columnIndex * stride - peekInset
    if (offset >= maxOffset - SNAP_EPSILON) break
    offsets.push(offset)
  }
  offsets.push(maxOffset)

  return offsets
}
