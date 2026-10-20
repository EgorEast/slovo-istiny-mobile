import { describe, expect, test } from '@jest/globals'
import { parsePatchFileName, verifyPatch } from './check-patches.mjs'

const MATCHING_PATCH = 'expo-font+58.0.9.patch'
const MISMATCHED_PATCH = 'expo-font+0.0.0.patch'
const MISSING_PACKAGE_PATCH = 'missing-package+1.0.0.patch'

describe('parsePatchFileName', () => {
  test('splits an unscoped package name and version', () => {
    expect(parsePatchFileName(MATCHING_PATCH)).toEqual({
      packageName: 'expo-font',
      version: '58.0.9',
    })
  })

  test('restores the scope separator for scoped packages', () => {
    expect(parsePatchFileName('@scope+package+1.2.3.patch')).toEqual({
      packageName: '@scope/package',
      version: '1.2.3',
    })
  })

  test('rejects names without a version separator', () => {
    expect(() => parsePatchFileName('expo-font.patch')).toThrow(/Cannot parse/)
  })
})

describe('verifyPatch', () => {
  test('accepts a patch whose version matches the installed package', () => {
    expect(verifyPatch(MATCHING_PATCH)).toEqual([])
  })

  test('reports a version mismatch', () => {
    const errors = verifyPatch(MISMATCHED_PATCH)

    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('targets 0.0.0')
    expect(errors[0]).toContain('is installed')
  })

  test('reports a missing package', () => {
    const errors = verifyPatch(MISSING_PACKAGE_PATCH)

    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('package missing-package not installed')
  })
})
