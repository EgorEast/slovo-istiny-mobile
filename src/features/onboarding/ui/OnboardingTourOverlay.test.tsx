import { createCtx } from '@reatom/framework'
import { act, fireEvent, waitFor } from '@testing-library/react-native'
import { currentAudioAtom } from 'entities/player/@x/onboarding'
import { renderWithProviders } from 'shared/mocks'
import {
  endOnboardingTour,
  type OnboardingTargetRect,
  onboardingTargetRectsAtom,
  onboardingTourAtom,
} from '../model'
import { OnboardingTourOverlay } from './OnboardingTourOverlay'

jest.mock('react-native-svg', () => {
  const { View } = jest.requireActual('react-native')

  return {
    __esModule: true,
    default: (props: object) => <View {...props} />,
    Mask: (props: object) => <View {...props} />,
    Rect: (props: object) => <View {...props} />,
  }
})

jest.mock('./TapIndicator', () => {
  const { Text } = jest.requireActual('react-native')

  return { TapIndicator: () => <Text>tap-indicator</Text> }
})

jest.mock('./TourDim', () => {
  const { Text } = jest.requireActual('react-native')

  return { TourDim: () => <Text>tour-dim</Text> }
})

const mockNavigate = jest.fn()
const mockPathname = jest.fn(() => '/listen')

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ navigate: mockNavigate }),
}))

const AUDIO = {
  artist: 'Проповедник',
  artwork: null,
  audioUrl: 'https://example.com/sermon.mp3',
  id: 'sermon-1',
  title: 'Проповедь',
}
const NEXT_LABEL = 'Далее'
const HINT = 'Выполните действие, чтобы продолжить'
const TAP_INDICATOR = 'tap-indicator'
const DIM = 'tour-dim'
const MISSING_TARGET_TIMEOUT_MS = 1200
const TAP_PHASE_TIMEOUT_MS = 3500
const SECTIONS_RECT: OnboardingTargetRect = { height: 4, width: 3, x: 1, y: 2 }
const OFFSCREEN_RECT: OnboardingTargetRect = { height: 60, width: 300, x: 0, y: 99999 }
const TAB_MORE_RECT: OnboardingTargetRect = { height: 60, width: 90, x: 300, y: 760 }

const renderAtStep = (
  scenarioId: 'listen' | 'player' | 'playlists' | 'settings',
  stepIndex: number,
  rects: Record<string, OnboardingTargetRect> = {},
  setup?: (ctx: ReturnType<typeof createCtx>) => void,
) => {
  const ctx = createCtx()
  onboardingTourAtom(ctx, { scenarioId, stepIndex })
  onboardingTargetRectsAtom(ctx, rects)
  setup?.(ctx)

  return renderWithProviders(<OnboardingTourOverlay />, { ctx })
}

describe('<OnboardingTourOverlay>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname.mockReturnValue('/listen')
  })

  test('renders nothing without an active tour', async () => {
    const { queryByText } = await renderWithProviders(<OnboardingTourOverlay />)

    expect(queryByText(NEXT_LABEL)).toBeNull()
  })

  test('renders the current step with next and close controls when the rect is ready', async () => {
    const { getByRole, getByText } = await renderAtStep('listen', 0, {
      'listen.sections': SECTIONS_RECT,
    })

    expect(getByText('Разделы проповедей')).toBeTruthy()
    expect(getByText(NEXT_LABEL)).toBeTruthy()
    expect(getByRole('button', { name: 'Завершить обзор' })).toBeTruthy()
  })

  test('renders a targetless step as a card with a back button on its inherited route', async () => {
    mockPathname.mockReturnValue('/listen/my-playlists')

    const { getByText } = await renderAtStep('playlists', 2)

    expect(getByText('Добавить проповедь')).toBeTruthy()
    expect(getByText('Назад')).toBeTruthy()
  })

  test('shows the done label on the last step', async () => {
    mockPathname.mockReturnValue('/listen/my-playlists')

    const { getByText, queryByText } = await renderAtStep('playlists', 2)

    expect(getByText('Готово')).toBeTruthy()
    expect(queryByText(NEXT_LABEL)).toBeNull()
  })

  test('ends the tour when the primary button is pressed on the last step', async () => {
    mockPathname.mockReturnValue('/listen/my-playlists')

    const { ctx, getByText } = await renderAtStep('playlists', 2)

    fireEvent.press(getByText('Готово'))

    expect(ctx.get(onboardingTourAtom)).toBeNull()
  })

  test('advances to the next step when the primary button is pressed on a non-last step', async () => {
    const { ctx, getByText } = await renderAtStep('listen', 0, {
      'listen.sections': SECTIONS_RECT,
    })

    fireEvent.press(getByText(NEXT_LABEL))

    expect(ctx.get(onboardingTourAtom)).toEqual({ scenarioId: 'listen', stepIndex: 1 })
  })

  test('navigates to the step route when the pathname differs', async () => {
    mockPathname.mockReturnValue('/settings')

    await renderAtStep('settings', 0)

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/more'))
  })

  test('renders nothing while the router is moving to the effective route', async () => {
    mockPathname.mockReturnValue('/listen')

    const { queryByText } = await renderAtStep('playlists', 2)

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/listen/my-playlists'))
    expect(queryByText('Добавить проповедь')).toBeNull()
  })

  test('blinks the tap hint before navigating to the effective route', async () => {
    mockPathname.mockReturnValue('/settings')

    const { getByText, queryByText } = await renderAtStep('settings', 0, {
      'tab.more': TAB_MORE_RECT,
    })

    // The tap phase is a pass-through layer: the hint shows, the dim/tooltip do not.
    expect(getByText(TAP_INDICATOR)).toBeTruthy()
    expect(queryByText(NEXT_LABEL)).toBeNull()

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/more'), {
      timeout: TAP_PHASE_TIMEOUT_MS,
    })
  })

  test('cancels the tap phase without navigating when the user reaches the route first', async () => {
    mockPathname.mockReturnValue('/settings')

    const { getByText, queryByText, rerender } = await renderAtStep('settings', 0, {
      'tab.more': TAB_MORE_RECT,
    })

    expect(getByText(TAP_INDICATOR)).toBeTruthy()

    mockPathname.mockReturnValue('/more')
    await act(async () => {
      rerender(<OnboardingTourOverlay />)
    })

    expect(queryByText(TAP_INDICATOR)).toBeNull()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('clears the tap phase when the tour ends', async () => {
    mockPathname.mockReturnValue('/settings')

    const { ctx, getByText, queryByText } = await renderAtStep('settings', 0, {
      'tab.more': TAB_MORE_RECT,
    })

    expect(getByText(TAP_INDICATOR)).toBeTruthy()

    await act(async () => {
      endOnboardingTour(ctx)
    })

    await waitFor(() => expect(queryByText(TAP_INDICATOR)).toBeNull())
  })

  test('renders a centered card when the registered rect is below the viewport', async () => {
    const { getByText } = await renderAtStep('listen', 3, {
      'listen.my-playlists': OFFSCREEN_RECT,
    })

    expect(getByText('Мои плейлисты')).toBeTruthy()
  })

  test('keeps the tooltip hidden until the missing-target timeout expires', async () => {
    const { getByText, queryByText } = await renderAtStep('listen', 0)

    expect(queryByText(NEXT_LABEL)).toBeNull()

    await waitFor(() => expect(getByText(NEXT_LABEL)).toBeTruthy(), {
      timeout: MISSING_TARGET_TIMEOUT_MS * 2,
    })
  })

  test('shows the wait card without a modal dim while the condition is unmet', async () => {
    const { getByRole, getByText, queryByText } = await renderAtStep('player', 0, {
      'listen.sections': SECTIONS_RECT,
    })

    expect(getByText(HINT)).toBeTruthy()
    expect(getByRole('button', { name: 'Завершить обзор' })).toBeTruthy()
    expect(queryByText(NEXT_LABEL)).toBeNull()
    expect(queryByText(DIM)).toBeNull()
  })

  test('returns the modal with the primary button once the wait condition is satisfied', async () => {
    const { getByText, queryByText } = await renderAtStep(
      'player',
      0,
      { 'listen.sections': SECTIONS_RECT },
      ctx => currentAudioAtom(ctx, AUDIO),
    )

    expect(queryByText(HINT)).toBeNull()
    expect(getByText(NEXT_LABEL)).toBeTruthy()
    expect(getByText(DIM)).toBeTruthy()
  })
})
