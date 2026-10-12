import AsyncStorage from '@react-native-async-storage/async-storage'
import { createCtx } from '@reatom/framework'
import { act, waitFor } from '@testing-library/react-native'
import { APP_VERSION } from 'shared/config'
import { renderHookWithProviders } from 'shared/mocks'
import { toursDisabledAtom } from 'shared/model'
import { onboardingTourAtom, startOnboardingTour } from '../model'
import { useAutoTours } from './useAutoTours'

jest.mock('../model', () => {
  const actual = jest.requireActual('../model')

  return { ...actual, startOnboardingTour: jest.fn(actual.startOnboardingTour) }
})

const DELAY_MS = 10
const SEEN_KEY = 'tours_seen_version'
const DIFFERENT_VERSION = 'not-the-current-version'

const mockStartTour = jest.mocked(startOnboardingTour)
const mockGetItem = jest.mocked(AsyncStorage.getItem)
const mockSetItem = jest.mocked(AsyncStorage.setItem)

const renderAutoTours = (ctx = createCtx()) =>
  renderHookWithProviders(() => useAutoTours({ delayMs: DELAY_MS }), { ctx })

const flushDelay = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, DELAY_MS * 5))
  })
}

describe('useAutoTours', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await AsyncStorage.clear()
  })

  test('skips everything and does not write the seen version when tours are disabled', async () => {
    mockGetItem.mockResolvedValue(null)
    const ctx = createCtx()
    toursDisabledAtom(ctx, true)

    await renderAutoTours(ctx)
    await flushDelay()

    expect(mockSetItem).not.toHaveBeenCalled()
    expect(mockStartTour).not.toHaveBeenCalled()
    expect(ctx.get(onboardingTourAtom)).toBeNull()
  })

  test('starts welcome and writes the seen version before starting when nothing was seen', async () => {
    mockGetItem.mockResolvedValue(null)

    const { ctx } = await renderAutoTours()

    await waitFor(() =>
      expect(ctx.get(onboardingTourAtom)).toEqual({ scenarioId: 'welcome', stepIndex: 0 }),
    )

    expect(mockSetItem).toHaveBeenCalledWith(SEEN_KEY, APP_VERSION)
    expect(mockSetItem.mock.invocationCallOrder[0]).toBeLessThan(
      mockStartTour.mock.invocationCallOrder[0],
    )
  })

  test('does nothing when the seen version matches the current one', async () => {
    mockGetItem.mockResolvedValue(APP_VERSION)

    const { ctx } = await renderAutoTours()
    await flushDelay()

    expect(mockSetItem).not.toHaveBeenCalled()
    expect(mockStartTour).not.toHaveBeenCalled()
    expect(ctx.get(onboardingTourAtom)).toBeNull()
  })

  test('starts whatsNew when the seen version differs from the current one', async () => {
    mockGetItem.mockResolvedValue(DIFFERENT_VERSION)

    const { ctx } = await renderAutoTours()

    await waitFor(() =>
      expect(ctx.get(onboardingTourAtom)).toEqual({ scenarioId: 'whatsNew', stepIndex: 0 }),
    )

    expect(mockSetItem).toHaveBeenCalledWith(SEEN_KEY, APP_VERSION)
    expect(mockSetItem.mock.invocationCallOrder[0]).toBeLessThan(
      mockStartTour.mock.invocationCallOrder[0],
    )
  })

  test('still writes the seen version but skips start when a tour is already active', async () => {
    mockGetItem.mockResolvedValue(null)
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'listen', stepIndex: 0 })

    await renderAutoTours(ctx)

    await waitFor(() => expect(mockSetItem).toHaveBeenCalledWith(SEEN_KEY, APP_VERSION))
    expect(mockStartTour).not.toHaveBeenCalled()
    expect(ctx.get(onboardingTourAtom)).toEqual({ scenarioId: 'listen', stepIndex: 0 })
  })
})
