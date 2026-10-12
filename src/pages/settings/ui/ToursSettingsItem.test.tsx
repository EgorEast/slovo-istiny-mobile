import { createCtx } from '@reatom/framework'
import { userEvent } from '@testing-library/react-native'
import { renderWithProviders } from 'shared/mocks'
import { setToursDisabled, toursDisabledAtom } from 'shared/model'
import { ToursSettingsItem } from './ToursSettingsItem'

const TITLE = 'Обзоры и подсказки'
const ROW_BUTTON_NAME = /Обзоры и подсказки/

jest.mock('shared/model', () => ({
  setToursDisabled: jest.fn(),
  toursDisabledAtom: jest
    .requireActual<{ atom: (value: boolean, name: string) => unknown }>('@reatom/framework')
    .atom(false, 'toursDisabledAtom'),
}))

const mockedSetToursDisabled = setToursDisabled as jest.MockedFunction<typeof setToursDisabled>

const renderItem = async (disabled: boolean) => {
  const ctx = createCtx()
  toursDisabledAtom(ctx, disabled)

  return renderWithProviders(<ToursSettingsItem />, { ctx })
}

describe('<ToursSettingsItem>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders the tours title', async () => {
    const { getByText } = await renderItem(false)

    expect(getByText(TITLE)).toBeTruthy()
  })

  test('tapping the row disables tours when enabled', async () => {
    const user = userEvent.setup()
    const { getByRole } = await renderItem(false)

    await user.press(getByRole('button', { name: ROW_BUTTON_NAME }))

    expect(mockedSetToursDisabled).toHaveBeenCalledWith(expect.anything(), true)
  })

  test('tapping the row enables tours when disabled', async () => {
    const user = userEvent.setup()
    const { getByRole } = await renderItem(true)

    await user.press(getByRole('button', { name: ROW_BUTTON_NAME }))

    expect(mockedSetToursDisabled).toHaveBeenCalledWith(expect.anything(), false)
  })
})
