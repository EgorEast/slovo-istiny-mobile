import AsyncStorage from '@react-native-async-storage/async-storage'
import z from 'zod'
import { createQueryCache } from './createQueryCache'

const INDEX_KEY = 'testSearch:index'
const PREFIX = 'testSearch'
const INDEXED_KEY = `${PREFIX}:q:вера`
const LEGACY_KEY = `${PREFIX}:старый`
const schema = z.array(z.string())

const createCache = () =>
  createQueryCache({
    indexKey: INDEX_KEY,
    label: 'Test',
    maxEntries: 30,
    prefix: PREFIX,
    schema,
  })

// The factory-armed prune runs a chain of microtasks; a macrotask turn drains it
// without triggering a write (which would otherwise self-heal a corrupt index).
const flushPrune = () => new Promise<void>(resolve => setTimeout(resolve, 0))

describe('createQueryCache', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await AsyncStorage.clear()
  })

  describe('startup prune of stale prefix keys', () => {
    test('removes legacy keys missing from a valid index and keeps indexed keys', async () => {
      await AsyncStorage.setItem(INDEXED_KEY, JSON.stringify(['a']))
      await AsyncStorage.setItem(INDEX_KEY, JSON.stringify([INDEXED_KEY]))
      await AsyncStorage.setItem(LEGACY_KEY, JSON.stringify(['b']))

      createCache()
      await flushPrune()

      expect(await AsyncStorage.getItem(LEGACY_KEY)).toBeNull()
      expect(await AsyncStorage.getItem(INDEXED_KEY)).not.toBeNull()
      expect(await AsyncStorage.getItem(INDEX_KEY)).not.toBeNull()
    })

    test('does not prune when the index is corrupt', async () => {
      await AsyncStorage.setItem(LEGACY_KEY, JSON.stringify(['b']))
      await AsyncStorage.setItem(INDEX_KEY, 'not-valid-json')

      createCache()
      await flushPrune()

      expect(await AsyncStorage.getItem(LEGACY_KEY)).not.toBeNull()
      expect(AsyncStorage.multiRemove).not.toHaveBeenCalled()
      expect(AsyncStorage.getAllKeys).not.toHaveBeenCalled()
    })

    test('does not prune when there is no index (fresh install)', async () => {
      await AsyncStorage.setItem(LEGACY_KEY, JSON.stringify(['b']))

      createCache()
      await flushPrune()

      expect(await AsyncStorage.getItem(LEGACY_KEY)).not.toBeNull()
      expect(AsyncStorage.multiRemove).not.toHaveBeenCalled()
      expect(AsyncStorage.getAllKeys).not.toHaveBeenCalled()
    })

    test('lets later writes chain after the prune', async () => {
      await AsyncStorage.setItem(INDEXED_KEY, JSON.stringify(['a']))
      await AsyncStorage.setItem(INDEX_KEY, JSON.stringify([INDEXED_KEY]))
      await AsyncStorage.setItem(LEGACY_KEY, JSON.stringify(['b']))

      const cache = createCache()
      await cache.set('новая', ['c'])

      expect(await AsyncStorage.getItem(LEGACY_KEY)).toBeNull()
      expect(await AsyncStorage.getItem(INDEXED_KEY)).not.toBeNull()
      expect(await AsyncStorage.getItem(`${PREFIX}:q:новая`)).not.toBeNull()
      const index = JSON.parse((await AsyncStorage.getItem(INDEX_KEY)) ?? '[]')
      expect(index).toEqual([INDEXED_KEY, `${PREFIX}:q:новая`])
    })
  })
})
