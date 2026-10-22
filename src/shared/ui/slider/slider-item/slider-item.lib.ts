import { match } from 'ts-pattern'
import { FONT_SIZES } from '../../theme/themed'
import { SliderItemSize, SliderItemTransform, WhereIsSlideTitleLocated } from './slider-item.types'

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
