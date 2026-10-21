import { match } from 'ts-pattern'
import { SIZE_OF_MINIMUM_SIDE_OF_SCREEN } from '../../../config/screen-dimensions'
import { FONT_SIZES, INDENTS } from '../../theme/themed'
import { SliderItemSize, SliderItemTransform, WhereIsSlideTitleLocated } from './slider-item.types'

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
// size. Always kept strictly below the card title size so the description never
// outshouts the title (the under-card title is a constant FONT_SIZES.md).
export const getDescriptionOnCardFontSize = (size: SliderItemSize): number =>
  match(size)
    .with(SliderItemSize.Small, () => FONT_SIZES.xs)
    .with(SliderItemSize.Middle, () => FONT_SIZES.sm)
    .with(SliderItemSize.Large, () => FONT_SIZES.base)
    .with(SliderItemSize.XLarge, () => FONT_SIZES.base)
    .exhaustive()

// Title font scales with the card; the under-card title is a constant caption.
export const getTitleFontSize = (
  size: SliderItemSize,
  placement: WhereIsSlideTitleLocated,
): number =>
  match(placement)
    .with(WhereIsSlideTitleLocated.Under, () => FONT_SIZES.md)
    .with(WhereIsSlideTitleLocated.On, () =>
      match(size)
        .with(SliderItemSize.Small, () => FONT_SIZES.md)
        .with(SliderItemSize.Middle, () => FONT_SIZES.lg)
        .with(SliderItemSize.Large, () => FONT_SIZES.h3)
        .with(SliderItemSize.XLarge, () => FONT_SIZES.h2)
        .exhaustive(),
    )
    .with(WhereIsSlideTitleLocated.Both, () =>
      match(size)
        .with(SliderItemSize.Small, () => FONT_SIZES.base)
        .with(SliderItemSize.Middle, () => FONT_SIZES.md)
        .with(SliderItemSize.Large, () => FONT_SIZES.lg)
        .with(SliderItemSize.XLarge, () => FONT_SIZES.h3)
        .exhaustive(),
    )
    .exhaustive()

// Larger cards get one more line: the description stays legible without
// covering the artwork. Taller cards afford a line, short ones give one back.
export const getDescriptionOnCardNumberOfLines = (
  size: SliderItemSize,
  transform?: SliderItemTransform,
): number => {
  const baseLines = match(size)
    .with(SliderItemSize.Small, () => 1)
    .with(SliderItemSize.Middle, () => 2)
    .with(SliderItemSize.Large, () => 2)
    .with(SliderItemSize.XLarge, () => 3)
    .exhaustive()

  if (transform === SliderItemTransform.Short) return Math.max(1, baseLines - 1)
  if (transform === SliderItemTransform.High) return Math.min(4, baseLines + 1)

  return baseLines
}

// `On` and `Both` render the same overlay DOM and differ only in the title area
// style (centered over the artwork vs pinned to the card bottom). Keeping the
// choice here makes the difference assertable without reaching into styles.
export const getTitleAreaStyleName = (
  isTitleBottom: boolean,
): 'titleBottomArea' | 'titleOnCardArea' => (isTitleBottom ? 'titleBottomArea' : 'titleOnCardArea')
