import { computeTooltipLayout } from './tooltipPosition'

const WINDOW_HEIGHT = 800
const TOOLTIP_HEIGHT = 200
const MARGIN = 24

describe('computeTooltipLayout', () => {
  test('centers the tooltip when there is no hole', () => {
    expect(computeTooltipLayout(null, TOOLTIP_HEIGHT, WINDOW_HEIGHT, MARGIN)).toEqual({ top: 300 })
  })

  test('places the tooltip above the hole when there is room', () => {
    const hole = { height: 50, width: 100, x: 0, y: 500 }

    expect(computeTooltipLayout(hole, TOOLTIP_HEIGHT, WINDOW_HEIGHT, MARGIN)).toEqual({ top: 276 })
  })

  test('places the tooltip below the hole when there is no room above', () => {
    const hole = { height: 50, width: 100, x: 0, y: 100 }

    expect(computeTooltipLayout(hole, TOOLTIP_HEIGHT, WINDOW_HEIGHT, MARGIN)).toEqual({ top: 174 })
  })

  test('clamps the tooltip to the bottom margin', () => {
    const hole = { height: 100, width: 100, x: 0, y: 0 }

    expect(computeTooltipLayout(hole, TOOLTIP_HEIGHT, 300, MARGIN)).toEqual({ top: 76 })
  })
})
