import AsyncStorage from '@react-native-async-storage/async-storage'
import { CURRENT_SOUND_POSITION } from 'shared/config'
import { ctx } from 'shared/lib/reatom-ctx'
import { playbackProgressSchema, savePlaybackProgress } from './playbackProgress'

const SERMON_ID = 'sermon-1'
const DURATION_MS = 120_000

const getStoredProgress = async () => {
  const raw = await AsyncStorage.getItem(CURRENT_SOUND_POSITION)
  expect(raw).not.toBeNull()
  return playbackProgressSchema.parse(JSON.parse(raw ?? '{}'))
}

const save = (positionMs: number, durationMs?: number) =>
  savePlaybackProgress(ctx, { durationMs, positionMs, sermonId: SERMON_ID })

describe('savePlaybackProgress', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
  })

  test('persists zero position when the track is paused less than 10s before the end', async () => {
    await save(DURATION_MS - 5_000, DURATION_MS)

    expect(await getStoredProgress()).toMatchObject({
      durationMs: DURATION_MS,
      positionMs: 0,
      sermonId: SERMON_ID,
    })
  })

  test('persists the real position when more than 10s remain', async () => {
    await save(DURATION_MS - 20_000, DURATION_MS)

    expect(await getStoredProgress()).toMatchObject({
      durationMs: DURATION_MS,
      positionMs: DURATION_MS - 20_000,
      sermonId: SERMON_ID,
    })
  })

  test('persists the real position when the duration is unknown', async () => {
    await save(DURATION_MS - 5_000)

    expect((await getStoredProgress()).positionMs).toBe(DURATION_MS - 5_000)
  })

  test('persists the real position when the duration is zero', async () => {
    await save(DURATION_MS - 5_000, 0)

    expect((await getStoredProgress()).positionMs).toBe(DURATION_MS - 5_000)
  })
})
