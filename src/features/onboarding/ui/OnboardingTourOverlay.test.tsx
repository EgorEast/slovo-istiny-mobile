import { createCtx } from '@reatom/framework'
import { waitFor } from '@testing-library/react-native'
import { renderWithProviders } from 'shared/mocks'
import { type OnboardingTargetRect, onboardingTargetRectsAtom, onboardingTourAtom } from '../model'
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

const mockPush = jest.fn()
const mockPathname = jest.fn(() => '/listen')

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockPush }),
}))

const NEXT_LABEL = 'Далее'
const MISSING_TARGET_TIMEOUT_MS = 1200
const SECTIONS_RECT: OnboardingTargetRect = { height: 4, width: 3, x: 1, y: 2 }

const renderAtStep = (
  scenarioId: 'listen' | 'playlists' | 'settings',
  stepIndex: number,
  rects: Record<string, OnboardingTargetRect> = {},
) => {
  const ctx = createCtx()
  onboardingTourAtom(ctx, { scenarioId, stepIndex })
  onboardingTargetRectsAtom(ctx, rects)

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

  test('renders a targetless step as a card with a back button', async () => {
    const { getByText } = await renderAtStep('playlists', 2)

    expect(getByText('Добавить проповедь')).toBeTruthy()
    expect(getByText('Назад')).toBeTruthy()
  })

  test('shows the done label on the last step', async () => {
    const { getByText, queryByText } = await renderAtStep('playlists', 2)

    expect(getByText('Готово')).toBeTruthy()
    expect(queryByText(NEXT_LABEL)).toBeNull()
  })

  test('navigates to the step route when the pathname differs', async () => {
    mockPathname.mockReturnValue('/settings')

    await renderAtStep('settings', 0)

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/more'))
  })

  test('keeps the tooltip hidden until the missing-target timeout expires', async () => {
    const { getByText, queryByText } = await renderAtStep('listen', 0)

    expect(queryByText(NEXT_LABEL)).toBeNull()

    await waitFor(() => expect(getByText(NEXT_LABEL)).toBeTruthy(), {
      timeout: MISSING_TARGET_TIMEOUT_MS * 2,
    })
  })
})
