import { createCtx } from '@reatom/framework'
import { renderWithProviders } from 'shared/mocks'
import { onboardingTourAtom } from '../model'
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

const NEXT_LABEL = 'Далее'
const PLAYLISTS = 'playlists' as const

const renderAtStep = (scenarioId: 'listen' | 'playlists', stepIndex: number) => {
  const ctx = createCtx()
  onboardingTourAtom(ctx, { scenarioId, stepIndex })
  return renderWithProviders(<OnboardingTourOverlay />, { ctx })
}

describe('<OnboardingTourOverlay>', () => {
  test('renders nothing without an active tour', async () => {
    const { queryByText } = await renderWithProviders(<OnboardingTourOverlay />)

    expect(queryByText(NEXT_LABEL)).toBeNull()
  })

  test('renders the current step with next and close controls', async () => {
    const { getByRole, getByText } = await renderAtStep('listen', 0)

    expect(getByText('Разделы проповедей')).toBeTruthy()
    expect(getByText(NEXT_LABEL)).toBeTruthy()
    expect(getByRole('button', { name: 'Завершить обзор' })).toBeTruthy()
  })

  test('renders a targetless step as a card with a back button', async () => {
    const { getByText } = await renderAtStep(PLAYLISTS, 1)

    expect(getByText('Создать плейлист')).toBeTruthy()
    expect(getByText('Назад')).toBeTruthy()
  })

  test('shows the done label on the last step', async () => {
    const { getByText, queryByText } = await renderAtStep(PLAYLISTS, 2)

    expect(getByText('Готово')).toBeTruthy()
    expect(queryByText(NEXT_LABEL)).toBeNull()
  })
})
