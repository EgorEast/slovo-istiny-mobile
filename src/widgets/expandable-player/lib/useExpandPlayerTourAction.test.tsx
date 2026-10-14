import { renderHook } from '@testing-library/react-native'
import { useTourActionRegistrar } from 'features/onboarding'
import { useExpandPlayerTourAction } from './useExpandPlayerTourAction'

jest.mock('features/onboarding', () => ({
  useTourActionRegistrar: jest.fn(),
}))

const EXPAND_PLAYER_ACTION_ID = 'expand-player'

const mockedRegistrar = jest.mocked(useTourActionRegistrar)

describe('useExpandPlayerTourAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('registers the expand action and performs the expand handler while audio exists', async () => {
    const expand = jest.fn()

    await renderHook(() => useExpandPlayerTourAction({ expand, hasAudio: true }))

    expect(mockedRegistrar).toHaveBeenCalledWith(EXPAND_PLAYER_ACTION_ID, expect.any(Function))

    const handler = mockedRegistrar.mock.calls[0][1]
    handler()

    expect(expand).toHaveBeenCalledTimes(1)
  })

  test('does not expand while no audio is loaded', async () => {
    const expand = jest.fn()

    await renderHook(() => useExpandPlayerTourAction({ expand, hasAudio: false }))

    const handler = mockedRegistrar.mock.calls[0][1]
    handler()

    expect(expand).not.toHaveBeenCalled()
  })
})
