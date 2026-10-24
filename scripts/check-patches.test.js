import { describe, expect, test } from '@jest/globals'
import {
  collectExpoAudioProblems,
  collectFileProblems,
  parsePatchFileName,
  verifyPatch,
} from './check-patches.mjs'

const MATCHING_PATCH = 'expo-font+58.0.9.patch'
const MISMATCHED_PATCH = 'expo-font+0.0.0.patch'
const MISSING_PACKAGE_PATCH = 'missing-package+1.0.0.patch'
const PATCH_MARKER = 'PATCH(patch-package)'
const PACKAGE_JSON_WITH_SOURCE_BUILD = {
  expo: { autolinking: { buildFromSource: ['expo-audio'] } },
}

const PATCHED_SOURCE = `
  // ${PATCH_MARKER}: the loop getter touched the player off the main thread
  Property("loop") { playlist ->
    runOnMain {
      playlist.loopMode.value
    }
  }.set { playlist, mode -> playlist.loopMode = mode }
`

const PROBE_FILE_PATH = 'node_modules/example/build/Module.js'
const PROBE_FIX_SIGNATURE = 'loadAsync(name, input).catch'
const MARKED_PROBE_SOURCE = `// ${PATCH_MARKER}: swallow async rejections
return loadAsync(name, input).catch(() => {})`
const UPSTREAM_FIXED_PROBE_SOURCE = 'return loadAsync(name, input).catch(() => {})'
const UNPATCHED_PROBE_SOURCE = 'return loadAsync(name, input)'

const UNWRAPPED_LOOP_GETTER = `
  // ${PATCH_MARKER}: the loop getter touched the player off the main thread
  Property("loop") { playlist ->
    playlist.loopMode.value
  }.set { playlist, mode -> playlist.loopMode = mode }
`

const PLAYER_AND_UNPATCHED_PLAYLIST = `
  Property("loop") { player ->
    runOnMain {
      player.ref.repeatMode == Player.REPEAT_MODE_ONE
    }
  }.set { player, isLooping -> player.ref.repeatMode = isLooping }
  // ${PATCH_MARKER}: the playlist loop getter needs a main-thread hop
  Property("loop") { playlist ->
    playlist.loopMode.value
  }.set { playlist, mode -> playlist.loopMode = mode }
`

const PATCHED_SEEK_INTERVAL_SOURCE = `
  internal fun seekIntervalMs(seconds: Double?): Long {
    // ${PATCH_MARKER}: non-positive values must fall back to the default too
    val resolved = seconds?.takeIf { it.isFinite() && it > 0.0 } ?: DEFAULT_SEEK_INTERVAL_SECONDS
    return (resolved * 1000).toLong().coerceAtLeast(MIN_SEEK_INTERVAL_MS)
  }
`

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

describe('collectFileProblems', () => {
  const collect = source =>
    collectFileProblems({
      filePath: PROBE_FILE_PATH,
      fixSignature: PROBE_FIX_SIGNATURE,
      source,
    })

  test('accepts a patched file', () => {
    expect(collect(MARKED_PROBE_SOURCE)).toEqual([])
  })

  test('accepts a patched file even when the upstream fix is present', () => {
    expect(collect(MARKED_PROBE_SOURCE + UPSTREAM_FIXED_PROBE_SOURCE)).toEqual([])
  })

  test('reports an upstream fix applied without a patch marker', () => {
    expect(collect(UPSTREAM_FIXED_PROBE_SOURCE)).toEqual([
      `${PROBE_FILE_PATH}: upstream fix detected without a patch marker — ` +
        'delete the patch if it covers this',
    ])
  })

  test('reports a missing patch signature', () => {
    expect(collect(UNPATCHED_PROBE_SOURCE)).toEqual([
      `${PROBE_FILE_PATH}: patch signature missing — patch did not apply (reinstall or re-create)`,
    ])
  })

  test('reports a missing target file', () => {
    expect(collect(null)).toEqual([
      `${PROBE_FILE_PATH}: target not found — package layout changed, review the patch`,
    ])
  })

  test('reports a missing signature when no fix signature is declared', () => {
    const problems = collectFileProblems({
      filePath: PROBE_FILE_PATH,
      source: UNPATCHED_PROBE_SOURCE,
    })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('patch signature missing')
  })
})

describe('collectExpoAudioProblems', () => {
  const collect = ({ audioModuleSource, packageJson }) =>
    collectExpoAudioProblems({
      audioModuleSource,
      seekIntervalSource: PATCHED_SEEK_INTERVAL_SOURCE,
      packageJson,
    })

  test('accepts a patched source built from source', () => {
    expect(
      collect({
        audioModuleSource: PATCHED_SOURCE,
        packageJson: PACKAGE_JSON_WITH_SOURCE_BUILD,
      }),
    ).toEqual([])
  })

  test('reports a loop getter that is not wrapped in runOnMain', () => {
    const problems = collect({
      audioModuleSource: UNWRAPPED_LOOP_GETTER,
      packageJson: PACKAGE_JSON_WITH_SOURCE_BUILD,
    })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('is not wrapped in runOnMain')
  })

  test('targets the patched playlist getter when an earlier loop property exists', () => {
    const problems = collect({
      audioModuleSource: PLAYER_AND_UNPATCHED_PLAYLIST,
      packageJson: PACKAGE_JSON_WITH_SOURCE_BUILD,
    })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('is not wrapped in runOnMain')
  })

  test('reports a missing patch marker', () => {
    const problems = collect({
      audioModuleSource: PATCHED_SOURCE.replace(PATCH_MARKER, ''),
      packageJson: PACKAGE_JSON_WITH_SOURCE_BUILD,
    })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('patch marker PATCH(patch-package) missing')
  })

  test('reports a missing buildFromSource list', () => {
    const problems = collect({
      audioModuleSource: PATCHED_SOURCE,
      packageJson: { expo: { autolinking: {} } },
    })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('is not in expo.autolinking.buildFromSource')
  })

  test('reports a buildFromSource list without expo-audio', () => {
    const problems = collect({
      audioModuleSource: PATCHED_SOURCE,
      packageJson: { expo: { autolinking: { buildFromSource: ['expo-font'] } } },
    })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('is not in expo.autolinking.buildFromSource')
  })

  test('reports an unreadable package.json', () => {
    const problems = collect({
      audioModuleSource: PATCHED_SOURCE,
      packageJson: null,
    })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('cannot read package.json')
  })

  test('reports a missing AudioModule.kt', () => {
    expect(
      collect({
        audioModuleSource: '',
        packageJson: PACKAGE_JSON_WITH_SOURCE_BUILD,
      }),
    ).toEqual(['expo-audio AudioModule.kt not found — cannot verify the loop-getter patch'])
  })

  test('reports a missing SeekInterval.kt', () => {
    expect(
      collectExpoAudioProblems({
        audioModuleSource: PATCHED_SOURCE,
        seekIntervalSource: '',
        packageJson: PACKAGE_JSON_WITH_SOURCE_BUILD,
      }),
    ).toEqual([
      'expo-audio SeekInterval.kt not found — cannot verify the seek-interval patch',
    ])
  })

  test('reports a missing patch marker in SeekInterval.kt', () => {
    expect(
      collectExpoAudioProblems({
        audioModuleSource: PATCHED_SOURCE,
        seekIntervalSource: PATCHED_SEEK_INTERVAL_SOURCE.replace(PATCH_MARKER, ''),
        packageJson: PACKAGE_JSON_WITH_SOURCE_BUILD,
      }),
    ).toEqual(['patch marker PATCH(patch-package) missing in SeekInterval.kt'])
  })

  test('reports a seekIntervalMs without the non-positive fallback', () => {
    const problems = collectExpoAudioProblems({
      audioModuleSource: PATCHED_SOURCE,
      seekIntervalSource: PATCHED_SEEK_INTERVAL_SOURCE.replace(' && it > 0.0', ''),
      packageJson: PACKAGE_JSON_WITH_SOURCE_BUILD,
    })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('does not fall back to the default on non-positive input')
  })
})
