import { INDENTS } from '../theme/themed'
import { SliderItemSize } from './slider-item/slider-item.types'
import {
  buildSliderSnapOffsets,
  getSliderCardLayout,
  getSliderLayoutViewport,
  MAX_SLIDER_LAYOUT_VIEWPORT,
} from './slider-layout.lib'

const MOCK_SCREEN_WIDTH = 390
const DEFAULT_VIEWPORT = MOCK_SCREEN_WIDTH - 2 * INDENTS.middle

// The default layout viewport is derived from SCREEN_WIDTH at call time; the
// width is inlined because hoisted jest.mock factories cannot reference
// module-level constants.
jest.mock('../../config/screen-dimensions', () => {
  const actual = jest.requireActual('../../config/screen-dimensions')
  return { ...actual, SCREEN_WIDTH: 390 }
})

const getContentWidth = (layout: { cardWidth: number; stride: number }, columnCount: number) =>
  (columnCount - 1) * layout.stride + layout.cardWidth

describe('getSliderCardLayout', () => {
  test('defaults to the screen-derived viewport', () => {
    expect(getSliderLayoutViewport()).toBe(DEFAULT_VIEWPORT)
  })

  test.each([
    [SliderItemSize.Small, 93.52941176470588, 105.52941176470588, 18.705882352941178],
    [SliderItemSize.Middle, 137.5, 149.5, 27.5],
    [SliderItemSize.Large, 244.28571428571428, 256.28571428571428, 48.857142857142854],
    [SliderItemSize.XLarge, 275.80645161290323, 287.80645161290323, 33.096774193548384],
  ])('%s card keeps the peek geometry at the default viewport', (size, width, stride, peek) => {
    const layout = getSliderCardLayout(size, DEFAULT_VIEWPORT)

    expect(layout.cardWidth).toBeCloseTo(width, 5)
    expect(layout.stride).toBeCloseTo(stride, 5)
    expect(layout.visiblePeek).toBeCloseTo(peek, 5)
  })

  test('caps the layout viewport at the biggest-phone reference', () => {
    expect(getSliderLayoutViewport(1000)).toBe(MAX_SLIDER_LAYOUT_VIEWPORT)
    expect(getSliderCardLayout(SliderItemSize.Small, 1000)).toEqual(
      getSliderCardLayout(SliderItemSize.Small, MAX_SLIDER_LAYOUT_VIEWPORT),
    )
  })

  test('floors the card width on a degenerate viewport', () => {
    expect(getSliderCardLayout(SliderItemSize.Small, 40).cardWidth).toBe(48)
  })
})

describe('buildSliderSnapOffsets', () => {
  const layout = getSliderCardLayout(SliderItemSize.Small, DEFAULT_VIEWPORT)
  const peekInset = layout.visiblePeek + INDENTS.middle

  test('peeks on both edges for a ten-column row', () => {
    const columnCount = 10
    const contentWidth = getContentWidth(layout, columnCount)
    const offsets = buildSliderSnapOffsets({
      columnCount,
      contentWidth,
      peekInset,
      stride: layout.stride,
      viewportWidth: DEFAULT_VIEWPORT,
    })

    expect(offsets).toHaveLength(8)
    expect(offsets[0]).toBe(0)
    expect(offsets.at(-1)).toBeCloseTo(contentWidth - DEFAULT_VIEWPORT, 5)
    offsets.slice(1, -1).forEach((offset, index) => {
      const expected = [
        74.82352941176471, 180.35294117647058, 285.88235294117646, 391.4117647058823,
        496.94117647058823, 602.4705882352941,
      ][index]
      expect(offset).toBeCloseTo(expected, 5)
    })
    const isStrictlyIncreasing = offsets.every(
      (offset, index) => index === 0 || offset > offsets[index - 1],
    )
    expect(isStrictlyIncreasing).toBe(true)
  })

  test('returns no offsets when the content fits the viewport', () => {
    const contentWidth = layout.cardWidth

    expect(
      buildSliderSnapOffsets({
        columnCount: 1,
        contentWidth,
        peekInset,
        stride: layout.stride,
        viewportWidth: DEFAULT_VIEWPORT,
      }),
    ).toEqual([])
    expect(
      buildSliderSnapOffsets({
        columnCount: 1,
        contentWidth,
        peekInset,
        stride: layout.stride,
        viewportWidth: 10_000,
      }),
    ).toEqual([])
  })

  // The requirement spec: whatever the size, screen width or column count,
  // every intermediate rest position must cut a card on BOTH edges.
  test.each([
    SliderItemSize.Small,
    SliderItemSize.Middle,
    SliderItemSize.Large,
    SliderItemSize.XLarge,
  ])('%s offsets always cut a card on both edges', size => {
    const widths = [320, 360, 390, 412, 430]
    const columnCount = 7

    widths.forEach(width => {
      const viewportWidth = Math.min(width - 2 * INDENTS.middle, MAX_SLIDER_LAYOUT_VIEWPORT)
      const sizeLayout = getSliderCardLayout(size, viewportWidth)
      const contentWidth = getContentWidth(sizeLayout, columnCount)
      const offsets = buildSliderSnapOffsets({
        columnCount,
        contentWidth,
        peekInset: sizeLayout.visiblePeek + INDENTS.middle,
        stride: sizeLayout.stride,
        viewportWidth,
      })

      expect(offsets[0]).toBe(0)
      expect(offsets.at(-1)).toBeCloseTo(contentWidth - viewportWidth, 5)

      offsets.slice(1, -1).forEach(offset => {
        const leftCut = offset % sizeLayout.stride
        const rightCut = (offset + viewportWidth) % sizeLayout.stride

        expect(leftCut).toBeGreaterThan(0)
        expect(leftCut).toBeLessThan(sizeLayout.cardWidth)
        expect(rightCut).toBeGreaterThan(0)
        expect(rightCut).toBeLessThan(sizeLayout.cardWidth)
      })
    })
  })
})
