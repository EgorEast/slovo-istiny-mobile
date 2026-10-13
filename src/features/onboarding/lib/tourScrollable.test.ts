import { isRectOutsideViewport, scrollOffsetFor } from './tourScrollable'

const VIEWPORT_HEIGHT = 800
const NO_INSET = 0

describe('isRectOutsideViewport', () => {
  test('is false when the rect is fully visible', () => {
    expect(
      isRectOutsideViewport({ height: 100, width: 100, x: 0, y: 600 }, VIEWPORT_HEIGHT, NO_INSET),
    ).toBe(false)
  })

  test('is false when the rect ends exactly on the fold', () => {
    expect(
      isRectOutsideViewport({ height: 100, width: 100, x: 0, y: 700 }, VIEWPORT_HEIGHT, NO_INSET),
    ).toBe(false)
  })

  test('is true when the rect ends below the fold', () => {
    expect(
      isRectOutsideViewport({ height: 100, width: 100, x: 0, y: 701 }, VIEWPORT_HEIGHT, NO_INSET),
    ).toBe(true)
  })

  test('is true when the rect starts above the viewport', () => {
    expect(
      isRectOutsideViewport({ height: 100, width: 100, x: 0, y: -1 }, VIEWPORT_HEIGHT, NO_INSET),
    ).toBe(true)
  })

  test('is false when the rect starts exactly on the top edge', () => {
    expect(
      isRectOutsideViewport({ height: 100, width: 100, x: 0, y: 0 }, VIEWPORT_HEIGHT, NO_INSET),
    ).toBe(false)
  })

  test('accounts for the bottom inset', () => {
    expect(
      isRectOutsideViewport({ height: 100, width: 100, x: 0, y: 700 }, VIEWPORT_HEIGHT, 100),
    ).toBe(true)
  })
})

describe('scrollOffsetFor', () => {
  test('centers the rect in the viewport', () => {
    expect(scrollOffsetFor({ height: 100, width: 100, x: 0, y: 1000 }, VIEWPORT_HEIGHT)).toBe(650)
  })

  test('clamps to zero near the top of the list', () => {
    expect(scrollOffsetFor({ height: 100, width: 100, x: 0, y: 10 }, VIEWPORT_HEIGHT)).toBe(0)
  })
})
