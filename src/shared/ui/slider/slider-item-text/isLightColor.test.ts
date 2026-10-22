import { isLightColor } from './isLightColor'

const CASES: Array<[string, boolean]> = [
  ['#000', false],
  ['#fff', true],
  // Short form expands each digit to a full channel ('#0ff' → '#00ffff').
  ['#0ff', true],
  // Perceived luminance weights green at 0.587: pure green lands just below 0.6.
  ['#0f0', false],
  // Hex is case-insensitive.
  ['#FFFFFF', true],
  // Unparseable values count as dark (the halo falls back to white).
  ['red', false],
  ['rgba(0, 0, 0, 0.5)', false],
  ['#12345', false],
  // Perceived-luminance boundary sits at 0.6: #999999 is exactly 0.6.
  ['#999999', true],
  ['#666666', false],
]

describe('isLightColor', () => {
  test.each(CASES)('%s → %s', (color, expected) => {
    expect(isLightColor(color)).toBe(expected)
  })
})
