import { createCtx } from '@reatom/framework'
import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import { renderWithProviders } from 'shared/mocks'
import { toursDisabledAtom } from 'shared/model'
import { HelpHeaderButton } from './HelpHeaderButton'

const HELP_BUTTON_LABEL = 'Онбординг и помощь'
const OFFER_TITLE = 'Обзор приложения'
const CONFIRM_LABEL = 'Посмотреть'
const CANCEL_LABEL = 'Закрыть'
const FIRST_SCENARIO_TITLE = 'Как слушать проповеди'

const mockPush = jest.fn()
const mockPathname = jest.fn(() => '/listen')

jest.mock('entities/feature-flags', () => ({
  useFeatureFlag: () => true,
}))

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockPush }),
}))

describe('<HelpHeaderButton>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname.mockReturnValue('/listen')
  })

  test('opens the offer dialog when pressed', async () => {
    await renderWithProviders(<HelpHeaderButton />)

    fireEvent.press(screen.getByRole('button', { name: HELP_BUTTON_LABEL }))

    expect(await screen.findByText(OFFER_TITLE)).toBeTruthy()
  })

  test('opening the picker lists the scenarios', async () => {
    await renderWithProviders(<HelpHeaderButton />)

    fireEvent.press(screen.getByRole('button', { name: HELP_BUTTON_LABEL }))
    fireEvent.press(await screen.findByText(CONFIRM_LABEL))

    expect(await screen.findByText(FIRST_SCENARIO_TITLE)).toBeTruthy()
  })

  test('closing the offer dialog hides it', async () => {
    await renderWithProviders(<HelpHeaderButton />)

    fireEvent.press(screen.getByRole('button', { name: HELP_BUTTON_LABEL }))
    fireEvent.press(await screen.findByText(CANCEL_LABEL))

    await waitFor(() => expect(screen.queryByText(OFFER_TITLE)).toBeNull())
  })

  test('renders nothing when tours are disabled', async () => {
    const ctx = createCtx()
    toursDisabledAtom(ctx, true)

    await renderWithProviders(<HelpHeaderButton />, { ctx })

    expect(screen.queryByRole('button', { name: HELP_BUTTON_LABEL })).toBeNull()
  })
})
