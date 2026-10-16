import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * One-time startup prune: drops keys under the cache namespace that the valid
 * index does not list — including legacy `<prefix>:<query>` keys from the
 * pre-`:q:` scheme. Returns early when there is no index (fresh install: nothing
 * is reachable) or the index is corrupt (self-heal in updateIndex owns that path).
 * @param config - Prune configuration.
 * @param config.indexKey - Storage key holding the recent-query index.
 * @param config.parseIndex - Safe parser for the raw index; `undefined` means corrupt.
 * @param config.prefix - Storage prefix; data keys are `${prefix}:q:<query>`.
 */
export const pruneStaleKeys = async ({
  indexKey,
  parseIndex,
  prefix,
}: {
  indexKey: string
  parseIndex: (jsonString: null | string) => string[] | undefined
  prefix: string
}): Promise<void> => {
  const rawIndex = await AsyncStorage.getItem(indexKey)
  if (rawIndex === null) return

  const index = parseIndex(rawIndex)
  if (index === undefined) return

  const allKeys = await AsyncStorage.getAllKeys()
  const staleKeys = allKeys.filter(
    key => key.startsWith(`${prefix}:`) && key !== indexKey && !index.includes(key),
  )
  if (staleKeys.length === 0) return

  await AsyncStorage.multiRemove(staleKeys)
}
