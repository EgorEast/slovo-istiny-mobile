import { action } from '@reatom/framework'
import { featureFlagsAtom } from '../model'
import { getCachedFlags } from './flagsCache/getCachedFlags'

/**
 * Startup hydration: commits the cached flag map before the network request
 * resolves, so a warm start opens the gated tabs instead of flashing them
 * closed. The read+commit runs in one scheduled transaction and never clobbers
 * a fresher in-memory value.
 */
export const hydrateCachedFeatureFlags = action(async ctx => {
  const cached = await getCachedFlags().catch(error => {
    console.error('[feature-flags] cache read failed:', error)
    return undefined
  })

  if (!cached || Object.keys(cached).length === 0) return

  await ctx.schedule(scheduledCtx => {
    if (scheduledCtx.get(featureFlagsAtom) != null) return

    featureFlagsAtom(scheduledCtx, cached)
  })
}, 'hydrateCachedFeatureFlags')
