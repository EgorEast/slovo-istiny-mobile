import { createCtx } from '@reatom/framework'
import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import { renderWithProviders } from 'shared/mocks'
import { toursDisabledAtom } from 'shared/model'
import { HelpHeaderButton } from './HelpHeaderButton'

const HELP_BUTTON_LABEL = 'Онбординг и помощь'
const PICKER_TITLE = 'Что посмотреть?'
const FIRST_SCENARIO_TITLE = 'Как слушать проповеди'
const BACKDROP_TEST_ID = 'modal-backdrop'

jest.mock('expo-router', () => ({
  usePathname: () => '/listen',
}))

jest.mock('entities/feature-flags', () => ({
  useFeatureFlag: () => true,
}))

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

  test('renders nothing when tours are disabled', async () => {
    const ctx = createCtx()
    toursDisabledAtom(ctx, true)

    await renderWithProviders(<HelpHeaderButton />, { ctx })

    expect(screen.queryByRole('button', { name: HELP_BUTTON_LABEL })).toBeNull()
  })
})
