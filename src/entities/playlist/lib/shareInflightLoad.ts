import { type AtomCache, type Ctx } from '@reatom/framework'
import { type LocalPlaylistData } from '../localPlaylists'

// The `ctx` received by an action is a per-call wrapper (`patchCtx`), so it
// cannot identify the context: every call brings a new object. The root `cause`
// is one per `createCtx()` and outlives calls, so it keys the in-flight map.
const getContextKey = (ctx: Ctx): AtomCache => {
  let rootCause = ctx.cause
  while (rootCause.cause) rootCause = rootCause.cause
  return rootCause
}

const inflightLoads = new WeakMap<AtomCache, Promise<LocalPlaylistData[]>>()

/**
 * Coalesces concurrent `loadMyPlaylists` calls on one Reatom context.
 *
 * The first call starts `load` and stores its promise synchronously (before the
 * first `await` inside it), so later concurrent calls share the same storage
 * snapshot instead of racing it. The entry is dropped once the read settles, so
 * sequential calls (pull-to-refresh) still re-read storage.
 * @param ctx - Reatom action context (per-call wrapper).
 * @param load - Starts the storage read and returns its resulting playlists.
 * @returns The shared load promise.
 */
export const shareInflightLoad = (
  ctx: Ctx,
  load: () => Promise<LocalPlaylistData[]>,
): Promise<LocalPlaylistData[]> => {
  const contextKey = getContextKey(ctx)
  const inflight = inflightLoads.get(contextKey)
  if (inflight) return inflight

  const loading = load()
  inflightLoads.set(contextKey, loading)
  return loading.finally(() => {
    inflightLoads.delete(contextKey)
  })
}
