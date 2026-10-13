import { computeTooltipLayout } from './tooltipPosition'

const WINDOW_HEIGHT = 800
const TOOLTIP_HEIGHT = 200
const MARGIN = 24
const NO_INSET = 0

describe('computeTooltipLayout', () => {
  test('centers the tooltip when there is no hole', () => {
    expect(computeTooltipLayout(null, TOOLTIP_HEIGHT, WINDOW_HEIGHT, NO_INSET, MARGIN)).toEqual({
      top: 300,
    })
  })

  test('keeps the centered tooltip unaffected when it already fits', () => {
    expect(computeTooltipLayout(null, TOOLTIP_HEIGHT, WINDOW_HEIGHT, 100, MARGIN)).toEqual({
      top: 250,
    })
  })

  test('clamps the centered tooltip to the top margin when the window is too short', () => {
    expect(computeTooltipLayout(null, TOOLTIP_HEIGHT, 240, NO_INSET, MARGIN)).toEqual({ top: 24 })
  })

  test('places the tooltip above the hole when there is room', () => {
    const hole = { height: 50, width: 100, x: 0, y: 500 }

    expect(computeTooltipLayout(hole, TOOLTIP_HEIGHT, WINDOW_HEIGHT, NO_INSET, MARGIN)).toEqual({
      top: 276,
    })
  })

  test('clamps the above-hole tooltip when the hole sits below the fold', () => {
    const hole = { height: 50, width: 100, x: 0, y: 1000 }

    expect(computeTooltipLayout(hole, TOOLTIP_HEIGHT, WINDOW_HEIGHT, NO_INSET, MARGIN)).toEqual({
      top: 576,
    })
  })

  test('places the tooltip below the hole when there is no room above', () => {
    const hole = { height: 50, width: 100, x: 0, y: 100 }

    expect(computeTooltipLayout(hole, TOOLTIP_HEIGHT, WINDOW_HEIGHT, NO_INSET, MARGIN)).toEqual({
      top: 174,
    })
  })

  test('clamps the tooltip to the bottom margin', () => {
    const hole = { height: 100, width: 100, x: 0, y: 0 }

    expect(computeTooltipLayout(hole, TOOLTIP_HEIGHT, 300, NO_INSET, MARGIN)).toEqual({ top: 76 })
  })

  test('lifts the below-hole tooltip above the bottom inset', () => {
    const hole = { height: 500, width: 100, x: 0, y: 100 }

    expect(computeTooltipLayout(hole, TOOLTIP_HEIGHT, WINDOW_HEIGHT, NO_INSET, MARGIN)).toEqual({
      top: 576,
    })
    expect(computeTooltipLayout(hole, TOOLTIP_HEIGHT, WINDOW_HEIGHT, 100, MARGIN)).toEqual({
      top: 476,
    })
  })
})
