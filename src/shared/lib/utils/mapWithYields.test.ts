import { mapWithYields } from './mapWithYields'

describe('mapWithYields', () => {
  test('maps every item preserving order', async () => {
    const result = await mapWithYields([1, 2, 3], async number => number * 2)

    expect(result).toEqual([2, 4, 6])
  })

  test('maps inputs larger than the chunk size', async () => {
    const items = Array.from({ length: 7 }, (_, index) => index)
    const seen: number[] = []

    const result = await mapWithYields(
      items,
      async number => {
        seen.push(number)
        return number
      },
      3,
    )

    expect(result).toEqual(items)
    expect(seen).toEqual(items)
  })

  test('returns an empty array without items', async () => {
    const result = await mapWithYields([], async () => 1)

    expect(result).toEqual([])
  })
})
