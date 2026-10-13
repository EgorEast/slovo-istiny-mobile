import { screen } from '@testing-library/react-native'
import { renderWithProviders } from 'shared/mocks'
import { ScenarioPickerModal } from './ScenarioPickerModal'

const SCREEN_GROUP_TITLE = 'На этом экране'
const GLOBAL_GROUP_TITLE = 'Глобальные'

const mockPathname = jest.fn(() => '/listen')

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname(),
}))

jest.mock('entities/feature-flags', () => ({
  useFeatureFlag: () => true,
}))

const renderPicker = () => renderWithProviders(<ScenarioPickerModal visible onClose={jest.fn()} />)

// Rows render in document order: the screen group first, then the global one.
const expectRowTitles = (titles: string[]) => {
  const rows = screen.getAllByRole('button')

  expect(rows).toHaveLength(titles.length)
  titles.forEach((title, index) => {
    expect(rows[index]).toHaveTextContent(title, { exact: false })
  })
}

describe('<ScenarioPickerModal>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname.mockReturnValue('/listen')
  })

  test('splits scenarios into screen and global groups on /listen', async () => {
    await renderPicker()

    expect(screen.getByText(SCREEN_GROUP_TITLE)).toBeTruthy()
    expect(screen.getByText(GLOBAL_GROUP_TITLE)).toBeTruthy()
    expectRowTitles([
      'Как слушать проповеди',
      'Плеер',
      'Плейлисты',
      'История прослушивания',
      'Офлайн-режим',
      'Настройки и резервные копии',
      'Читать книги',
      'Учиться',
      'Добро пожаловать',
      'Что нового',
    ])
  })

  test('keeps only the playlists scenario local on the playlist list screen', async () => {
    mockPathname.mockReturnValue('/listen/playlist')

    await renderPicker()

    expectRowTitles([
      'Плейлисты',
      'Как слушать проповеди',
      'Плеер',
      'История прослушивания',
      'Офлайн-режим',
      'Настройки и резервные копии',
      'Читать книги',
      'Учиться',
      'Добро пожаловать',
      'Что нового',
    ])
  })

  test('keeps only the settings scenario local on the settings screen', async () => {
    mockPathname.mockReturnValue('/settings')

    await renderPicker()

    expectRowTitles([
      'Настройки и резервные копии',
      'Как слушать проповеди',
      'Плеер',
      'Плейлисты',
      'История прослушивания',
      'Офлайн-режим',
      'Читать книги',
      'Учиться',
      'Добро пожаловать',
      'Что нового',
    ])
  })

  test('shows the More screen scenarios local on /more', async () => {
    mockPathname.mockReturnValue('/more')

    await renderPicker()

    expectRowTitles([
      'История прослушивания',
      'Офлайн-режим',
      'Настройки и резервные копии',
      'Как слушать проповеди',
      'Плеер',
      'Плейлисты',
      'Читать книги',
      'Учиться',
      'Добро пожаловать',
      'Что нового',
    ])
  })

  test('skips the screen group when no scenario matches the route', async () => {
    mockPathname.mockReturnValue('/about')

    await renderPicker()

    expect(screen.queryByText(SCREEN_GROUP_TITLE)).toBeNull()
    expect(screen.getByText(GLOBAL_GROUP_TITLE)).toBeTruthy()
  })
})
