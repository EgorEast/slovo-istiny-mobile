import { match } from 'ts-pattern'
import { SIZE_OF_MINIMUM_SIDE_OF_SCREEN } from '../../../config/screen-dimensions'
import { FONT_SIZES, INDENTS } from '../../theme/themed'
import { SliderItemSize, SliderItemTransform } from './slider-item.types'

// Largest common phone min side. Cards scale with the screen up to this
// reference; on larger screens (tablets/desktop) they keep the exact
// proportions of the biggest phone instead of growing indefinitely.
const MAX_MOBILE_MIN_SIDE = 430

export const getSliderItemWidth = (size: SliderItemSize): number => {
  const referenceSide = Math.min(SIZE_OF_MINIMUM_SIDE_OF_SCREEN, MAX_MOBILE_MIN_SIDE)

  return match(size)
    .with(SliderItemSize.Small, () => referenceSide * 0.285)
    .with(SliderItemSize.Middle, () => referenceSide * 0.44)
    .with(SliderItemSize.Large, () => referenceSide * 0.62)
    .with(SliderItemSize.XLarge, () => referenceSide * 0.9)
    .exhaustive()
}

// Height of the card's artwork area for a given item width: `high` stretches
// the cover, `short` crops it, `undefined` keeps the square. Shared by the real
// item and its skeleton so the placeholder never drifts from the card.
export const getSliderItemImageHeight = (
  itemWidth: number,
  transform?: SliderItemTransform,
): number =>
  match(transform)
    .with(SliderItemTransform.High, () => itemWidth * 1.3)
    .with(SliderItemTransform.Short, () => itemWidth / 2)
    .with(undefined, () => itemWidth)
    .exhaustive()

// Full horizontal step between two neighbouring items: the item width plus the
// inter-item gap. The virtualized slider uses it to lay every column out.
export const getSliderItemStride = (size: SliderItemSize): number =>
  getSliderItemWidth(size) + INDENTS.middle

// Font size for the playlist description overlay on a card, scaled by item
// size. Kept below the card title size (FONT_SIZES.h3) so the description never
// outshouts the title.
export const getDescriptionOnCardFontSize = (size: SliderItemSize): number =>
  match(size)
    .with(SliderItemSize.Small, () => FONT_SIZES.xs)
    .with(SliderItemSize.Middle, () => FONT_SIZES.sm)
    .with(SliderItemSize.Large, () => FONT_SIZES.base)
    .with(SliderItemSize.XLarge, () => FONT_SIZES.md)
    .exhaustive()

// Larger cards get one more line: the description stays legible without
// covering the artwork.
export const getDescriptionOnCardNumberOfLines = (size: SliderItemSize): number =>
  match(size)
    .with(SliderItemSize.Small, () => 2)
    .with(SliderItemSize.Middle, () => 2)
    .with(SliderItemSize.Large, () => 3)
    .with(SliderItemSize.XLarge, () => 3)
    .exhaustive()
