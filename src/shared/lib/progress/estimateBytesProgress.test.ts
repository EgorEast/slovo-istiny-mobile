import {
  estimateBytesPercent,
  ESTIMATED_AUDIO_BYTES,
  ESTIMATED_PROGRESS_CAP_PERCENT,
} from './estimateBytesProgress'

describe('estimateBytesPercent', () => {
  test('returns 0 for a non-positive estimate', () => {
    expect(estimateBytesPercent(500, 0)).toBe(0)
    expect(estimateBytesPercent(500, -1)).toBe(0)
  })

  test('returns 0 for non-positive bytes', () => {
    expect(estimateBytesPercent(0, 1000)).toBe(0)
    expect(estimateBytesPercent(-100, 1000)).toBe(0)
  })

  test('computes the floored share of the estimated total', () => {
    expect(estimateBytesPercent(500, 1000)).toBe(50)
    expect(estimateBytesPercent(333, 1000)).toBe(33)
  })

  test('caps the estimate at the default cap', () => {
    expect(estimateBytesPercent(ESTIMATED_AUDIO_BYTES, ESTIMATED_AUDIO_BYTES)).toBe(
      ESTIMATED_PROGRESS_CAP_PERCENT,
    )
    expect(estimateBytesPercent(ESTIMATED_AUDIO_BYTES * 2, ESTIMATED_AUDIO_BYTES)).toBe(
      ESTIMATED_PROGRESS_CAP_PERCENT,
    )
  })

  test('honours a custom cap', () => {
    expect(estimateBytesPercent(1000, 1000, 80)).toBe(80)
    expect(estimateBytesPercent(500, 1000, 80)).toBe(50)
  })
})
