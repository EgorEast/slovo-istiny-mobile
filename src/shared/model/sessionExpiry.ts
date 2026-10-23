import { action, atom } from '@reatom/framework'

// Monotonic signal: the server explicitly revoked the session (refresh rejected
// with 401/403 — e.g. a password change bumps tokenVersion and kills every
// device's session). Transient failures (network, 5xx, 429) must not bump it.
// Shared stays free of auth atoms and navigation — entities/auth reacts to the
// signal and resets its own state; the admin layout then redirects to login.
export const sessionExpiredAtom = atom(0, 'sessionExpiredAtom')

export const markSessionExpired = action(ctx => {
  sessionExpiredAtom(ctx, ctx.get(sessionExpiredAtom) + 1)
}, 'markSessionExpired')
