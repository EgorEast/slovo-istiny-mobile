import { createCtx } from '@reatom/framework'
import { authMocks } from 'shared/api/generated'
import { markSessionExpired, toastAtom } from 'shared/model'
import { authStatusAtom, authUserAtom } from '../model'
import { watchSessionExpiry } from './watchSessionExpiry'

const SESSION_EXPIRED_MESSAGE = 'Сессия истекла, войдите заново'

describe('watchSessionExpiry', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  test('drops the auth state and toasts when the session is revoked', () => {
    const ctx = createCtx()
    authUserAtom(ctx, authMocks.getAuthControllerGetProfileResponseMock({ role: 'admin' }))
    authStatusAtom(ctx, 'authenticated')

    const unsubscribe = watchSessionExpiry(ctx)
    markSessionExpired(ctx)

    expect(ctx.get(authUserAtom)).toBeNull()
    expect(ctx.get(authStatusAtom)).toBe('unauthenticated')
    expect(ctx.get(toastAtom)).toBe(SESSION_EXPIRED_MESSAGE)

    unsubscribe()
  })

  test('keeps the auth state for the current signal when the watcher starts', () => {
    const ctx = createCtx()
    const user = authMocks.getAuthControllerGetProfileResponseMock({ role: 'admin' })
    authUserAtom(ctx, user)
    authStatusAtom(ctx, 'authenticated')

    // Starting the watcher must not fire the handler for an already-seen signal.
    const unsubscribe = watchSessionExpiry(ctx)

    expect(ctx.get(authUserAtom)).toEqual(user)
    expect(ctx.get(authStatusAtom)).toBe('authenticated')
    expect(ctx.get(toastAtom)).toBeNull()

    unsubscribe()
  })
})
