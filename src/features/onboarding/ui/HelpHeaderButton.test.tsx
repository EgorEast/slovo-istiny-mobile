import { createCtx } from '@reatom/framework'
import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import { renderWithProviders } from 'shared/mocks'
import { toursDisabledAtom } from 'shared/model'
import { LightTheme } from 'shared/ui/theme'
import { HelpHeaderButton } from './HelpHeaderButton'

const HELP_BUTTON_LABEL = 'Онбординг и помощь'
const PICKER_TITLE = 'Что посмотреть?'
const FIRST_SCENARIO_TITLE = 'Как слушать проповеди'
const BACKDROP_TEST_ID = 'modal-backdrop'

const mockIoniconsSpy = jest.fn()

jest.mock('expo-router', () => ({
  usePathname: () => '/listen',
}))

jest.mock('entities/feature-flags', () => ({
  useFeatureFlag: () => true,
}))

jest.mock('shared/ui/theme', () => {
  const actual = jest.requireActual('shared/ui/theme')

  return {
    ...actual,
    useTheme: () => ({ currentTheme: actual.LightTheme, isLight: true, themeMode: 'light' }),
  }
})

jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = jest.requireActual('react-native')

  return {
    __esModule: true,
    default: (props: { color?: unknown; name: string }) => {
      mockIoniconsSpy(props)

      return <Text>{props.name}</Text>
    },
  }
})

jest.mock('./OnboardingTarget', () => {
  const { Text } = jest.requireActual('react-native')

  return {
    OnboardingTarget: ({ children, id }: { children: React.ReactNode; id?: string }) => (
      <>
        {id === undefined ? null : <Text>{id}</Text>}
        {children}
      </>
    ),
  }
})

describe('<HelpHeaderButton>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('opens the scenario picker directly when pressed', async () => {
    await renderWithProviders(<HelpHeaderButton />)

    fireEvent.press(screen.getByRole('button', { name: HELP_BUTTON_LABEL }))

    expect(await screen.findByText(PICKER_TITLE)).toBeTruthy()
    expect(await screen.findByText(FIRST_SCENARIO_TITLE)).toBeTruthy()
  })

  test('closing the picker hides it', async () => {
    await renderWithProviders(<HelpHeaderButton />)

    fireEvent.press(screen.getByRole('button', { name: HELP_BUTTON_LABEL }))
    await screen.findByText(PICKER_TITLE)

    fireEvent.press(screen.getByTestId(BACKDROP_TEST_ID))

    await waitFor(() => expect(screen.queryByText(PICKER_TITLE)).toBeNull())
  })

  test('wraps the help button in the app-wide onboarding target', async () => {
    await renderWithProviders(<HelpHeaderButton />)

    expect(screen.getByText('app.help-button')).toBeTruthy()
  })

  test('renders nothing when tours are disabled', async () => {
    const ctx = createCtx()
    toursDisabledAtom(ctx, true)

    await renderWithProviders(<HelpHeaderButton />, { ctx })

    expect(screen.queryByRole('button', { name: HELP_BUTTON_LABEL })).toBeNull()
  })

  test('tints the help icon with the theme text color by default', async () => {
    await renderWithProviders(<HelpHeaderButton />)

    expect(mockIoniconsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ color: LightTheme.text }),
    )
  })

  test('honors an explicit tintColor override', async () => {
    await renderWithProviders(<HelpHeaderButton tintColor='#abcdef' />)

    expect(mockIoniconsSpy).toHaveBeenCalledWith(expect.objectContaining({ color: '#abcdef' }))
  })
})
