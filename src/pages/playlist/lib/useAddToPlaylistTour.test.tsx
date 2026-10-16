import { act, renderHook } from '@testing-library/react-native'
import { type ReactElement } from 'react'
import { useTourActionRegistrar } from 'features/onboarding'
import { FAVORITES_PLAYLIST } from 'entities/playlist'
import { useAddToPlaylistTour } from './useAddToPlaylistTour'

jest.mock('features/onboarding', () => ({
  OnboardingTarget: ({ children }: { children: React.ReactNode }) => children,
  useTourActionRegistrar: jest.fn(),
}))

const CHECK_ACTION_ID = 'check-add-modal-favorites'
const FAVORITES_TARGET_ID = 'playlist.add-modal-favorites'
const SAVE_TARGET_ID = 'playlist.add-modal-save'

const registeredAction = () =>
  jest.mocked(useTourActionRegistrar).mock.calls.find(([id]) => id === CHECK_ACTION_ID)?.[1]

const targetIdOf = (element: ReactElement) => (element as ReactElement<{ id?: string }>).props.id

describe('useAddToPlaylistTour', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('registers the check-favorites action that ticks the bound modal control', async () => {
    const { result } = await renderHook(() => useAddToPlaylistTour())

    const action = registeredAction()
    expect(action).toBeDefined()

    const setPlaylistChecked = jest.fn()
    await act(async () => {
      result.current.bindControls({ setPlaylistChecked })
    })

    action?.()

    expect(setPlaylistChecked).toHaveBeenCalledWith(FAVORITES_PLAYLIST.id, true)
  })

  test('clears the bound controls when the modal unmounts', async () => {
    const { result } = await renderHook(() => useAddToPlaylistTour())
    const setPlaylistChecked = jest.fn()

    await act(async () => {
      result.current.bindControls({ setPlaylistChecked })
      result.current.bindControls(null)
    })

    registeredAction()?.()

    expect(setPlaylistChecked).not.toHaveBeenCalled()
  })

  test('wraps only the favorites row and always the save button in onboarding targets', async () => {
    const { result } = await renderHook(() => useAddToPlaylistTour())
    const row = <></>

    expect(targetIdOf(result.current.renderRowWrapper(row, FAVORITES_PLAYLIST.id))).toBe(
      FAVORITES_TARGET_ID,
    )
    expect(result.current.renderRowWrapper(row, 'other-playlist')).toBe(row)
    expect(targetIdOf(result.current.renderSaveWrapper(row))).toBe(SAVE_TARGET_ID)
  })
})
