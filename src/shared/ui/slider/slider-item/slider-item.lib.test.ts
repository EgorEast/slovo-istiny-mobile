import { FONT_SIZES, INDENTS } from '../../../ui/theme/themed'
import { SliderItemSize } from './slider-item.types'

interface SliderItemLib {
  getDescriptionOnCardFontSize: (size: SliderItemSize) => number
  getDescriptionOnCardNumberOfLines: (size: SliderItemSize) => number
  getSliderItemStride: (size: SliderItemSize) => number
  getSliderItemWidth: (size: SliderItemSize) => number
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
  test('grows with the item size but stays below the card title size', () => {
    const { getDescriptionOnCardFontSize } = loadSliderItemLib(SMALL_PHONE_MIN_SIDE)

    expect(getDescriptionOnCardFontSize(SliderItemSize.Small)).toBe(FONT_SIZES.xs)
    expect(getDescriptionOnCardFontSize(SliderItemSize.XLarge)).toBe(FONT_SIZES.md)
    expect(getDescriptionOnCardFontSize(SliderItemSize.XLarge)).toBeLessThan(FONT_SIZES.h3)
  })
})

describe('getDescriptionOnCardNumberOfLines', () => {
  test('allows more lines on larger cards', () => {
    const { getDescriptionOnCardNumberOfLines } = loadSliderItemLib(SMALL_PHONE_MIN_SIDE)

    expect(getDescriptionOnCardNumberOfLines(SliderItemSize.Small)).toBe(2)
    expect(getDescriptionOnCardNumberOfLines(SliderItemSize.XLarge)).toBe(3)
  })
})
