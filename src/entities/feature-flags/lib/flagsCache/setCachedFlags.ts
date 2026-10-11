import { setCachedJson } from 'shared/lib/cache'
import { CACHED_FEATURE_FLAGS } from './cacheKey'

export const setCachedFlags = async (flags: Record<string, boolean>): Promise<void> =>
  setCachedJson(CACHED_FEATURE_FLAGS, flags)
