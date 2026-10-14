import { screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { renderWithProviders } from 'shared/mocks'
import { INDENTS } from 'shared/ui/theme'
import { type ScenarioScope } from '../lib/scenarios'
import { ScenarioPickerModal } from './ScenarioPickerModal'

const SCREEN_GROUP_TITLE = 'На этом экране'
const GLOBAL_GROUP_TITLE = 'Глобальные'
const PLAYER_GROUP_TITLE = 'Плеер'

const mockPathname = jest.fn(() => '/listen')

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname(),
}))

jest.mock('entities/feature-flags', () => ({
  useFeatureFlag: () => true,
}))

const renderPicker = (scope?: ScenarioScope) =>
  renderWithProviders(<ScenarioPickerModal visible scope={scope} onClose={jest.fn()} />)

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
      'Плейлисты',
      'Результаты поиска',
      'Плеер',
      'Экран плейлиста',
      'Добавление в плейлист',
      'История прослушивания',
      'Офлайн-режим',
      'Настройки и резервные копии',
      'Читать книги',
      'Учиться',
      'Поделиться приложением',
      'Добро пожаловать',
      'Что нового',
    ])
  })

  test('keeps both playlist tours local on the playlist screen', async () => {
    mockPathname.mockReturnValue('/listen/playlist')

    await renderPicker()

    expectRowTitles([
      'Экран плейлиста',
      'Добавление в плейлист',
      'Как слушать проповеди',
      'Плеер',
      'Плейлисты',
      'Результаты поиска',
      'История прослушивания',
      'Офлайн-режим',
      'Настройки и резервные копии',
      'Читать книги',
      'Учиться',
      'Поделиться приложением',
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
      'Результаты поиска',
      'Экран плейлиста',
      'Добавление в плейлист',
      'История прослушивания',
      'Офлайн-режим',
      'Читать книги',
      'Учиться',
      'Поделиться приложением',
      'Добро пожаловать',
      'Что нового',
    ])
  })

  test('keeps only the share scenario local on the share screen', async () => {
    mockPathname.mockReturnValue('/share')

    await renderPicker()

    expectRowTitles([
      'Поделиться приложением',
      'Как слушать проповеди',
      'Плеер',
      'Плейлисты',
      'Результаты поиска',
      'Экран плейлиста',
      'Добавление в плейлист',
      'История прослушивания',
      'Офлайн-режим',
      'Настройки и резервные копии',
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
      'Результаты поиска',
      'Экран плейлиста',
      'Добавление в плейлист',
      'Читать книги',
      'Учиться',
      'Поделиться приложением',
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

  test('bounds the scroll area and pads the last row above the system nav bar', async () => {
    await renderPicker()

    const scroll = screen.getByTestId('scenario-picker-scroll')

    expect(StyleSheet.flatten(scroll.props.contentContainerStyle)).toMatchObject({
      paddingBottom: INDENTS.low,
    })
  })

  test('player scope shows the player tours plus the global scenarios', async () => {
    await renderPicker('player')

    expect(screen.queryByText(SCREEN_GROUP_TITLE)).toBeNull()
    // The «Плеер» group header shares its text with the global «Плеер» row.
    expect(screen.getAllByText(PLAYER_GROUP_TITLE)).toHaveLength(2)
    expect(screen.getByText(GLOBAL_GROUP_TITLE)).toBeTruthy()
    expectRowTitles([
      'Экран плеера',
      'Подробнее и таймкоды',
      'Скорость прослушивания',
      'Настройка звука',
      'Плеер',
      'Добро пожаловать',
      'Что нового',
    ])
  })
})
