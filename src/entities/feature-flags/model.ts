import { action, atom } from '@reatom/framework'
import { featureFlagsApi } from 'shared/api'
import { showToast } from 'shared/model'
import { setCachedFlags } from './lib/flagsCache/setCachedFlags'

const FEATURE_FLAGS_LOAD_ERROR_MESSAGE = 'Не удалось загрузить фича-флаги'

// null = флаги ещё не загружены (запрос в полёте или ошибка).
// Потребители трактуют null как «доступ закрыт» — см. useFeatureFlag.
export const featureFlagsAtom = atom<null | Record<string, boolean>>(null, 'featureFlagsAtom')

// Internal — marks that the previous fetch already failed, so the toast shows
// only on the success→failure transition instead of on every foreground refetch.
const flagsFetchFailedAtom = atom<boolean>(false, 'flagsFetchFailedAtom')

const isSameFlags = (
  current: null | Record<string, boolean>,
  next: Record<string, boolean>,
): boolean => {
  if (current == null) return false

  const nextKeys = Object.keys(next)
  if (nextKeys.length !== Object.keys(current).length) return false

  return nextKeys.every(key => current[key] === next[key])
}

// GET /feature-flags/me has optional auth: anonymous callers receive the global
// flag state, authenticated ones their effective flags (the Authorization header
// is attached by the axios request interceptor when a token exists). Always fetch.
export const fetchMyFeatureFlags = action(async ctx => {
  try {
    const { flags } = await featureFlagsApi
      .getFeatureFlags()
      .featureFlagsControllerGetEffectiveForMe()

    const flagsByKey: Record<string, boolean> = Object.fromEntries(
      flags.map(({ enabled, key }): [string, boolean] => [key, enabled]),
    )

    // Не перезаписываем кеш, если значение не изменилось: лишний рефетч
    // (foreground, восстановление сессии) иначе трогал бы AsyncStorage без нужды.
    if (!isSameFlags(ctx.get(featureFlagsAtom), flagsByKey))
      await setCachedFlags(flagsByKey).catch((error: unknown) =>
        console.error('[feature-flags] cache write failed:', error),
      )

    await ctx.schedule(() => {
      flagsFetchFailedAtom(ctx, false)
      featureFlagsAtom(ctx, flagsByKey)
    })
  } catch (error) {
    console.error('fetchMyFeatureFlags failed:', error)

    await ctx.schedule(() => {
      if (ctx.get(flagsFetchFailedAtom)) return

      flagsFetchFailedAtom(ctx, true)

      if (ctx.get(featureFlagsAtom) == null) showToast(ctx, FEATURE_FLAGS_LOAD_ERROR_MESSAGE)
    })
  }
}, 'fetchMyFeatureFlags')
