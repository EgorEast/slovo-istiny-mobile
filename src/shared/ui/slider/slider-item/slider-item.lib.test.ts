import { FONT_SIZES, INDENTS } from '../../../ui/theme/themed'
import { SliderItemSize, SliderItemTransform, WhereIsSlideTitleLocated } from './slider-item.types'

interface SliderItemLib {
  getDescriptionOnCardFontSize: (size: SliderItemSize) => number
  getDescriptionOnCardNumberOfLines: (
    size: SliderItemSize,
    transform?: SliderItemTransform,
  ) => number
  getSliderItemStride: (size: SliderItemSize) => number
  getSliderItemWidth: (size: SliderItemSize) => number
  getTitleAreaStyleName: (isTitleBottom: boolean) => string
  getTitleFontSize: (size: SliderItemSize, placement: WhereIsSlideTitleLocated) => number
}

const SMALL_PHONE_MIN_SIDE = 390
const LARGE_SCREEN_MIN_SIDE = 744

// The library reads the minimum screen side once at module load, so each case
// re-evaluates it with the wanted screen: a fresh module registry reading this
// holder. Hoisted jest.mock factories cannot reference module-level constants,
// hence the mutable object.
const mockScreenDimensions = { minSide: SMALL_PHONE_MIN_SIDE }

jest.mock('../../../config/screen-dimensions', () => ({
  get SIZE_OF_MINIMUM_SIDE_OF_SCREEN() {
    return mockScreenDimensions.minSide
  },
}))

const loadSliderItemLib = (minSide: number) => {
  mockScreenDimensions.minSide = minSide
  jest.resetModules()

  return jest.requireActual<SliderItemLib>('./slider-item.lib')
}

describe('getSliderItemWidth', () => {
  test.each([
    [SliderItemSize.Small, 111.15],
    [SliderItemSize.Middle, 171.6],
    [SliderItemSize.Large, 241.8],
    [SliderItemSize.XLarge, 351],
  ])('on a phone, scales %s with the screen', (size, expectedWidth) => {
    expect(loadSliderItemLib(SMALL_PHONE_MIN_SIDE).getSliderItemWidth(size)).toBeCloseTo(
      expectedWidth,
      5,
    )
  })

  test.each([
    [SliderItemSize.Small, 122.55],
    [SliderItemSize.Middle, 189.2],
    [SliderItemSize.Large, 266.6],
    [SliderItemSize.XLarge, 387],
  ])('on a large screen, keeps %s at the biggest-phone proportions', (size, expectedWidth) => {
    expect(loadSliderItemLib(LARGE_SCREEN_MIN_SIDE).getSliderItemWidth(size)).toBeCloseTo(
      expectedWidth,
      5,
    )
  })
})

describe('getSliderItemStride', () => {
  test('adds the middle indent to the item width', () => {
    const { getSliderItemStride } = loadSliderItemLib(SMALL_PHONE_MIN_SIDE)

    expect(getSliderItemStride(SliderItemSize.Small)).toBeCloseTo(111.15 + INDENTS.middle, 5)
  })
})

describe('getDescriptionOnCardFontSize', () => {
  test.each([
    [SliderItemSize.Small, FONT_SIZES.xs],
    [SliderItemSize.Middle, FONT_SIZES.sm],
    [SliderItemSize.Large, FONT_SIZES.base],
    [SliderItemSize.XLarge, FONT_SIZES.base],
  ])('keeps the %s description at %i, strictly under the title font', (size, expectedFontSize) => {
    const { getDescriptionOnCardFontSize } = loadSliderItemLib(SMALL_PHONE_MIN_SIDE)
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
    const { getDescriptionOnCardNumberOfLines } = loadSliderItemLib(SMALL_PHONE_MIN_SIDE)

    expect(getDescriptionOnCardNumberOfLines(size)).toBe(expectedLines)
  })

  test.each([
    [SliderItemSize.Small, 1],
    [SliderItemSize.Middle, 1],
    [SliderItemSize.Large, 1],
    [SliderItemSize.XLarge, 2],
  ])('takes a line back on a short %s card', (size, expectedLines) => {
    const { getDescriptionOnCardNumberOfLines } = loadSliderItemLib(SMALL_PHONE_MIN_SIDE)

    expect(getDescriptionOnCardNumberOfLines(size, SliderItemTransform.Short)).toBe(expectedLines)
  })

  test.each([
    [SliderItemSize.Small, 2],
    [SliderItemSize.Middle, 3],
    [SliderItemSize.Large, 3],
    [SliderItemSize.XLarge, 4],
  ])('adds a line on a high %s card', (size, expectedLines) => {
    const { getDescriptionOnCardNumberOfLines } = loadSliderItemLib(SMALL_PHONE_MIN_SIDE)

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
    const { getTitleFontSize } = loadSliderItemLib(SMALL_PHONE_MIN_SIDE)

    expect(getTitleFontSize(size, placement)).toBe(expectedFontSize)
  })
})

describe('getTitleAreaStyleName', () => {
  test('pins the title to the card bottom when requested', () => {
    const { getTitleAreaStyleName } = loadSliderItemLib(SMALL_PHONE_MIN_SIDE)

    expect(getTitleAreaStyleName(true)).toBe('titleBottomArea')
  })

  test('centers the title over the artwork otherwise', () => {
    const { getTitleAreaStyleName } = loadSliderItemLib(SMALL_PHONE_MIN_SIDE)

    expect(getTitleAreaStyleName(false)).toBe('titleOnCardArea')
  })
})
