import { validate } from 'uuid'
import { generateUuid } from './generateUuid'

const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const SAMPLE_SIZE = 50

// The first 48 bits of a UUIDv7 are the Unix timestamp in milliseconds.
const readTimestamp = (id: string): number => Number.parseInt(id.slice(0, 8) + id.slice(9, 13), 16)

describe('generateUuid', () => {
  test('returns unique, valid UUIDv7 values', () => {
    const ids = Array.from({ length: SAMPLE_SIZE }, () => generateUuid())

    expect(new Set(ids).size).toBe(SAMPLE_SIZE)
    for (const id of ids) {
      expect(validate(id)).toBe(true)
      expect(id).toMatch(UUID_V7_PATTERN)
    }
  })

  test('stamps non-decreasing creation timestamps', () => {
    const timestamps = Array.from({ length: SAMPLE_SIZE }, () => readTimestamp(generateUuid()))

    expect([...timestamps].sort((left, right) => left - right)).toEqual(timestamps)
  })

  test('keeps v7 shape when crypto is missing', () => {
    const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: undefined })

    try {
      expect(generateUuid()).toMatch(UUID_V7_PATTERN)
    } finally {
      if (cryptoDescriptor) Object.defineProperty(globalThis, 'crypto', cryptoDescriptor)
    }
  })

  test('keeps v7 shape when crypto.getRandomValues throws', () => {
    const getRandomValues = jest.spyOn(globalThis.crypto, 'getRandomValues')
    getRandomValues.mockImplementation(() => {
      throw new Error('crypto unavailable')
    })

    try {
      expect(generateUuid()).toMatch(UUID_V7_PATTERN)
    } finally {
      getRandomValues.mockRestore()
    }
  })
})
