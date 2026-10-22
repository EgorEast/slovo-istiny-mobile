import { FONT_SIZES } from '../../../ui/theme/themed'
import {
  getDescriptionOnCardFontSize,
  getDescriptionOnCardNumberOfLines,
  getTitleAreaStyleName,
  getTitleFontSize,
} from './slider-item.lib'
import { SliderItemSize, SliderItemTransform, WhereIsSlideTitleLocated } from './slider-item.types'

describe('getDescriptionOnCardFontSize', () => {
  test.each([
    [SliderItemSize.Small, FONT_SIZES.xs],
    [SliderItemSize.Middle, FONT_SIZES.sm],
    [SliderItemSize.Large, FONT_SIZES.base],
    [SliderItemSize.XLarge, FONT_SIZES.base],
  ])('keeps the %s description at %i, strictly under the title font', (size, expectedFontSize) => {
    const fontSize = getDescriptionOnCardFontSize(size)

    expect(fontSize).toBe(expectedFontSize)
    expect(fontSize).toBeLessThan(FONT_SIZES.md)
  })
})

describe('getDescriptionOnCardNumberOfLines', () => {
  test.each([
    [SliderItemSize.Small, 1],
    [SliderItemSize.Middle, 2],
    [SliderItemSize.Large, 2],
    [SliderItemSize.XLarge, 3],
  ])('gives %s %i lines without a transform', (size, expectedLines) => {
    expect(getDescriptionOnCardNumberOfLines(size)).toBe(expectedLines)
  })

  test.each([
    [SliderItemSize.Small, 1],
    [SliderItemSize.Middle, 1],
    [SliderItemSize.Large, 1],
    [SliderItemSize.XLarge, 2],
  ])('takes a line back on a short %s card', (size, expectedLines) => {
    expect(getDescriptionOnCardNumberOfLines(size, SliderItemTransform.Short)).toBe(expectedLines)
  })

  test.each([
    [SliderItemSize.Small, 2],
    [SliderItemSize.Middle, 3],
    [SliderItemSize.Large, 3],
    [SliderItemSize.XLarge, 4],
  ])('adds a line on a high %s card', (size, expectedLines) => {
    expect(getDescriptionOnCardNumberOfLines(size, SliderItemTransform.High)).toBe(expectedLines)
  })
})

describe('getTitleFontSize', () => {
  test.each([
    [WhereIsSlideTitleLocated.Under, SliderItemSize.Small, FONT_SIZES.md],
    [WhereIsSlideTitleLocated.Under, SliderItemSize.Middle, FONT_SIZES.md],
    [WhereIsSlideTitleLocated.Under, SliderItemSize.Large, FONT_SIZES.md],
    [WhereIsSlideTitleLocated.Under, SliderItemSize.XLarge, FONT_SIZES.md],
    [WhereIsSlideTitleLocated.On, SliderItemSize.Small, FONT_SIZES.md],
    [WhereIsSlideTitleLocated.On, SliderItemSize.Middle, FONT_SIZES.lg],
    [WhereIsSlideTitleLocated.On, SliderItemSize.Large, FONT_SIZES.h3],
    [WhereIsSlideTitleLocated.On, SliderItemSize.XLarge, FONT_SIZES.h2],
    [WhereIsSlideTitleLocated.Both, SliderItemSize.Small, FONT_SIZES.base],
    [WhereIsSlideTitleLocated.Both, SliderItemSize.Middle, FONT_SIZES.md],
    [WhereIsSlideTitleLocated.Both, SliderItemSize.Large, FONT_SIZES.lg],
    [WhereIsSlideTitleLocated.Both, SliderItemSize.XLarge, FONT_SIZES.h3],
  ])('keeps the %s title on a %s card at %i', (placement, size, expectedFontSize) => {
    expect(getTitleFontSize(size, placement)).toBe(expectedFontSize)
  })
})

describe('getTitleAreaStyleName', () => {
  test('pins the title to the card bottom when requested', () => {
    expect(getTitleAreaStyleName(true)).toBe('titleBottomArea')
  })

  test('centers the title over the artwork otherwise', () => {
    expect(getTitleAreaStyleName(false)).toBe('titleOnCardArea')
  })
})
