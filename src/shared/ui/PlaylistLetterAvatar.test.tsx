import { APP_ICON_URI as IMAGE_PLACEHOLDER } from '../lib/app-icon'
import { renderWithProviders } from '../mocks'
import { PlaylistLetterAvatar } from './PlaylistLetterAvatar'

const BACKGROUND_TEST_ID = 'playlist-letter-avatar-background'

describe('<PlaylistLetterAvatar>', () => {
  test('renders the upper-cased first letter of the title', async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistLetterAvatar size={50} title='избранные' />,
    )

    expect(getByText('И')).toBeTruthy()
  })

  test('ignores surrounding whitespace when picking the letter', async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistLetterAvatar size={50} title='  проповеди' />,
    )

    expect(getByText('П')).toBeTruthy()
  })

  test('uses the default cover artwork as the tile background', async () => {
    const { getByTestId } = await renderWithProviders(
      <PlaylistLetterAvatar size={50} title='проповеди' />,
    )

    expect(getByTestId(BACKGROUND_TEST_ID).props.source).toEqual({ uri: IMAGE_PLACEHOLDER })
  })

  test('keeps the tile background but omits the letter when showLetter is false', async () => {
    const { getByTestId, queryByText } = await renderWithProviders(
      <PlaylistLetterAvatar size={50} title='проповеди' showLetter={false} />,
    )

    expect(queryByText('П')).toBeNull()
    expect(getByTestId(BACKGROUND_TEST_ID)).toBeTruthy()
  })
})
