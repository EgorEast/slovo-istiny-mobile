import { getCachedJson } from 'shared/lib/cache'
import { CACHED_FEATURE_FLAGS } from './cacheKey'
import { featureFlagsMapSchema } from './featureFlagsMapSchema'

export const getCachedFlags = async (): Promise<Record<string, boolean> | undefined> =>
  getCachedJson(CACHED_FEATURE_FLAGS, featureFlagsMapSchema)
