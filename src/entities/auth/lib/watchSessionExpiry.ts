import { action } from '@reatom/framework'
import { sessionExpiredAtom, showToast } from 'shared/model'
import { authStatusAtom, authUserAtom } from '../model'

const SESSION_EXPIRED_MESSAGE = 'Сессия истекла, войдите заново'

/**
 * Bridges the shared session-expiry signal into the auth entity: the axios
 * interceptor already cleared the stored tokens and cached profile, here the
 * reactive state is dropped so the admin guard redirects to `/admin/login`.
 * Returns the Reatom unsubscribe, so the owner can detach the watcher.
 */
export const watchSessionExpiry = action(ctx => {
  let handledSignal = ctx.get(sessionExpiredAtom)

  return ctx.subscribe(sessionExpiredAtom, signal => {
    if (signal === handledSignal) return
    handledSignal = signal

    ctx.schedule(() => {
      authUserAtom(ctx, null)
      authStatusAtom(ctx, 'unauthenticated')
      showToast(ctx, SESSION_EXPIRED_MESSAGE)
    })
  })
}, 'watchSessionExpiry')
