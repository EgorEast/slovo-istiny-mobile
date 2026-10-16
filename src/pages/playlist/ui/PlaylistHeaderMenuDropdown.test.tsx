import { fireEvent, render, screen } from '@testing-library/react-native'
import { PlaylistHeaderMenuDropdown } from './PlaylistHeaderMenuDropdown'
import { PlaylistHistoryMenuItem } from './PlaylistHistoryMenuItem'
import { PlaylistOfflineMenuItem } from './PlaylistOfflineMenuItem'
import { PlaylistShareMenuItem } from './PlaylistShareMenuItem'

jest.mock('shared/ui/theme', () => {
  const actual = jest.requireActual('shared/ui/theme')
  return {
    ...actual,
    useTheme: jest.fn(() => ({
      currentTheme: {
        icon: '#333',
        surface: '#fff',
        text: '#000',
        textMuted: '#999',
      },
    })),
  }
})

jest.mock('shared/ui/menu', () => {
  const { View } = jest.requireActual('react-native')
  return {
    AnchoredDropdown: ({
      children,
      onClose,
      visible,
    }: {
      children: React.ReactNode
      onClose: () => void
      visible: boolean
    }) => {
      if (!visible) return null
      return (
        <View testID='anchored-dropdown'>
          <View testID='backdrop' onTouchEnd={onClose} />
          {children}
        </View>
      )
    },
  }
})

jest.mock('features/onboarding', () => {
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

jest.mock('./PlaylistMenuDivider', () => {
  const { Text } = jest.requireActual('react-native')

  return { PlaylistMenuDivider: () => <Text>menu-divider</Text> }
})

const ANCHOR = { height: 36, width: 44, x: 300, y: 500 }

const ADD_ALL_TO_OFFLINE_TEXT = 'Добавить все в офлайн'
const STOP_CACHING_TEXT = 'Остановить добавление в офлайн'
const ALL_CACHED_TEXT = 'Плейлист в офлайне'
const CLEAR_CACHE_TEXT = 'Удалить из офлайн все'
const MARK_ALL_TEXT = 'Пометить все прослушанными'
const REMOVE_TEXT = 'Удалить проповеди из истории'
const SHARE_TEXT = 'Поделиться плейлистом'
const PUBLISH_TEXT = 'Добавить в глобальные'
const DELETE_TEXT = 'Удалить плейлист'
const CLEAR_TEXT = 'Очистить плейлист'
const ADD_ALL_TO_PLAYLIST_TEXT = 'Добавить все проповеди в плейлист'

const defaultProps = {
  allCached: false,
  anchor: ANCHOR,
  canClear: false,
  canDelete: false,
  canMarkAll: false,
  canPublish: false,
  canRemoveFromHistory: false,
  isAddAllToOfflineDisabled: false,
  isCaching: false,
  isClearCacheDisabled: false,
  isOfflineItemsVisible: true,
  isShareDisabled: false,
  onAddAllToOffline: jest.fn(),
  onClear: jest.fn(),
  onClearCache: jest.fn(),
  onClose: jest.fn(),
  onDelete: jest.fn(),
  onMarkAll: jest.fn(),
  onPublish: jest.fn(),
  onRemoveFromHistory: jest.fn(),
  onShare: jest.fn(),
  onStopCaching: jest.fn(),
  visible: true,
}

const renderDropdown = (
  props?: Partial<typeof defaultProps> & { onAddAllToPlaylist?: () => void },
) => render(<PlaylistHeaderMenuDropdown {...defaultProps} {...props} />)

describe('<PlaylistHeaderMenuDropdown>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('shows "Добавить все в офлайн" with cloud-download when not caching and not all cached', async () => {
    await renderDropdown()

    expect(screen.getByText(ADD_ALL_TO_OFFLINE_TEXT)).toBeTruthy()
    expect(screen.queryByText(STOP_CACHING_TEXT)).toBeNull()
  })

  test('shows "Плейлист в офлайне" with check-circle-outline when allCached', async () => {
    await renderDropdown({ allCached: true })

    expect(screen.getByText(ALL_CACHED_TEXT)).toBeTruthy()
    expect(screen.queryByText(ADD_ALL_TO_OFFLINE_TEXT)).toBeNull()
  })

  test('isCaching=true shows "Остановить добавление в офлайн" with stop-circle-outline', async () => {
    await renderDropdown({ isCaching: true })

    expect(screen.getByText(STOP_CACHING_TEXT)).toBeTruthy()
    expect(screen.queryByText(ADD_ALL_TO_OFFLINE_TEXT)).toBeNull()
    expect(screen.queryByText(ALL_CACHED_TEXT)).toBeNull()
  })

  test('isCaching=true stop item is enabled (pressing it fires onStopCaching)', async () => {
    const onStopCaching = jest.fn()
    await renderDropdown({ isCaching: true, onStopCaching })

    fireEvent.press(screen.getByText(STOP_CACHING_TEXT))

    expect(onStopCaching).toHaveBeenCalledTimes(1)
  })

  test('isCaching=true + offline: stop item still enabled', async () => {
    const onStopCaching = jest.fn()
    await renderDropdown({ isAddAllToOfflineDisabled: true, isCaching: true, onStopCaching })

    fireEvent.press(screen.getByText(STOP_CACHING_TEXT))

    expect(onStopCaching).toHaveBeenCalledTimes(1)
  })

  test('onAddAllToOffline fires when add-all-to-offline item is pressed (not caching)', async () => {
    const onAddAllToOffline = jest.fn()
    await renderDropdown({ onAddAllToOffline })

    fireEvent.press(screen.getByText(ADD_ALL_TO_OFFLINE_TEXT))

    expect(onAddAllToOffline).toHaveBeenCalledTimes(1)
  })

  test('add-all-to-offline item is disabled for an empty playlist', async () => {
    const onAddAllToOffline = jest.fn()
    await renderDropdown({ isAddAllToOfflineDisabled: true, onAddAllToOffline })

    expect(screen.getByText(ADD_ALL_TO_OFFLINE_TEXT)).toBeTruthy()

    fireEvent.press(screen.getByText(ADD_ALL_TO_OFFLINE_TEXT))

    expect(onAddAllToOffline).not.toHaveBeenCalled()
  })

  test('clear-all disabled when cachedCount===0', async () => {
    const onClearCache = jest.fn()
    await renderDropdown({ isClearCacheDisabled: true, onClearCache })

    fireEvent.press(screen.getByText(CLEAR_CACHE_TEXT))

    expect(onClearCache).not.toHaveBeenCalled()
  })

  test('clear-all enabled when there are cached items and no queue/inflight', async () => {
    const onClearCache = jest.fn()
    await renderDropdown({ isClearCacheDisabled: false, onClearCache })

    fireEvent.press(screen.getByText(CLEAR_CACHE_TEXT))

    expect(onClearCache).toHaveBeenCalledTimes(1)
  })

  test('menu does not close on stop caching (handler wired, menu stays open)', async () => {
    const onClose = jest.fn()
    await renderDropdown({ isCaching: true, onClose })

    fireEvent.press(screen.getByText(STOP_CACHING_TEXT))

    expect(onClose).not.toHaveBeenCalled()
  })

  test('always renders both cache menu items with divider', async () => {
    await renderDropdown()

    expect(screen.getByText(ADD_ALL_TO_OFFLINE_TEXT)).toBeTruthy()
    expect(screen.getByText(CLEAR_CACHE_TEXT)).toBeTruthy()
  })

  test('always renders the share item', async () => {
    await renderDropdown()

    expect(screen.getByText(SHARE_TEXT)).toBeTruthy()
  })

  test('fires onShare when the share item is pressed', async () => {
    const onShare = jest.fn()
    await renderDropdown({ onShare })

    fireEvent.press(screen.getByText(SHARE_TEXT))

    expect(onShare).toHaveBeenCalledTimes(1)
  })

  test('does not fire onShare when the share item is disabled', async () => {
    const onShare = jest.fn()
    await renderDropdown({ isShareDisabled: true, onShare })

    fireEvent.press(screen.getByText(SHARE_TEXT))

    expect(onShare).not.toHaveBeenCalled()
  })

  test('hides the add-all-to-playlist item without a callback (player sheet)', async () => {
    await renderDropdown()

    expect(screen.queryByText(ADD_ALL_TO_PLAYLIST_TEXT)).toBeNull()
  })

  test('shows the add-all-to-playlist item and fires it when the callback is provided', async () => {
    const onAddAllToPlaylist = jest.fn()
    await renderDropdown({ onAddAllToPlaylist })

    expect(screen.getByText(ADD_ALL_TO_PLAYLIST_TEXT)).toBeTruthy()

    fireEvent.press(screen.getByText(ADD_ALL_TO_PLAYLIST_TEXT))

    expect(onAddAllToPlaylist).toHaveBeenCalledTimes(1)
  })

  test('hides the publish item for a non-local playlist', async () => {
    await renderDropdown()

    expect(screen.queryByText(PUBLISH_TEXT)).toBeNull()
  })

  test('shows the publish item for a publishable playlist and fires onPublish when pressed', async () => {
    const onPublish = jest.fn()
    await renderDropdown({ canPublish: true, onPublish })

    expect(screen.getByText(PUBLISH_TEXT)).toBeTruthy()

    fireEvent.press(screen.getByText(PUBLISH_TEXT))

    expect(onPublish).toHaveBeenCalledTimes(1)
  })

  test('hides history items when both flags are false', async () => {
    await renderDropdown()

    expect(screen.queryByText(MARK_ALL_TEXT)).toBeNull()
    expect(screen.queryByText(REMOVE_TEXT)).toBeNull()
  })

  test('shows mark-all item and fires onMarkAll when canMarkAll', async () => {
    const onMarkAll = jest.fn()
    await renderDropdown({ canMarkAll: true, onMarkAll })

    expect(screen.getByText(MARK_ALL_TEXT)).toBeTruthy()
    expect(screen.queryByText(REMOVE_TEXT)).toBeNull()

    fireEvent.press(screen.getByText(MARK_ALL_TEXT))
    expect(onMarkAll).toHaveBeenCalledTimes(1)
  })

  test('shows remove item and fires onRemoveFromHistory when canRemoveFromHistory', async () => {
    const onRemoveFromHistory = jest.fn()
    await renderDropdown({ canRemoveFromHistory: true, onRemoveFromHistory })

    expect(screen.getByText(REMOVE_TEXT)).toBeTruthy()
    expect(screen.queryByText(MARK_ALL_TEXT)).toBeNull()

    fireEvent.press(screen.getByText(REMOVE_TEXT))
    expect(onRemoveFromHistory).toHaveBeenCalledTimes(1)
  })

  test('shows both history items when both flags are true', async () => {
    await renderDropdown({ canMarkAll: true, canRemoveFromHistory: true })

    expect(screen.getByText(MARK_ALL_TEXT)).toBeTruthy()
    expect(screen.getByText(REMOVE_TEXT)).toBeTruthy()
  })

  test('hides the delete item when canDelete is false', async () => {
    await renderDropdown()

    expect(screen.queryByText(DELETE_TEXT)).toBeNull()
  })

  test('shows the delete item and fires onDelete when canDelete', async () => {
    const onDelete = jest.fn()
    await renderDropdown({ canDelete: true, onDelete })

    expect(screen.getByText(DELETE_TEXT)).toBeTruthy()

    fireEvent.press(screen.getByText(DELETE_TEXT))

    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  test('hides the clear item when canClear is false', async () => {
    await renderDropdown()

    expect(screen.queryByText(CLEAR_TEXT)).toBeNull()
  })

  test('shows the clear item and fires onClear when canClear', async () => {
    const onClear = jest.fn()
    await renderDropdown({ canClear: true, onClear })

    expect(screen.getByText(CLEAR_TEXT)).toBeTruthy()

    fireEvent.press(screen.getByText(CLEAR_TEXT))

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  test('wires an onboarding target id for every rendered menu row', async () => {
    await renderDropdown({
      canClear: true,
      canDelete: true,
      canMarkAll: true,
      canPublish: true,
      canRemoveFromHistory: true,
      onAddAllToPlaylist: jest.fn(),
    })

    const ids = [
      'playlist.menu-share',
      'playlist.menu-add-all',
      'playlist.menu-publish',
      'playlist.menu-offline-add',
      'playlist.menu-offline-remove',
      'playlist.menu-history-mark',
      'playlist.menu-history-remove',
      'playlist.menu-clear',
      'playlist.menu-delete',
    ]

    ids.forEach(id => expect(screen.getByText(id)).toBeTruthy())
  })
})

const DIVIDER_TEXT = 'menu-divider'

describe('<PlaylistHeaderMenuDropdown> dividers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const countDividers = () => screen.getAllByText(DIVIDER_TEXT).length

  test('renders a single divider before the offline group', async () => {
    await renderDropdown()

    expect(countDividers()).toBe(1)
  })

  test('adds a divider between the share row and the batch rows', async () => {
    await renderDropdown({ onAddAllToPlaylist: jest.fn() })

    expect(countDividers()).toBe(2)
  })

  test('separates history and destructive groups from the rest', async () => {
    await renderDropdown({ canClear: true, canMarkAll: true })

    // offline leading + history + destructive
    expect(countDividers()).toBe(3)
  })

  test('renders exactly one divider per non-empty group boundary', async () => {
    await renderDropdown({
      canClear: true,
      canDelete: true,
      canMarkAll: true,
      canPublish: true,
      canRemoveFromHistory: true,
      onAddAllToPlaylist: jest.fn(),
    })

    // share|batch, batch|offline, offline|history, history|destructive
    expect(countDividers()).toBe(4)
  })

  test('keeps one divider per boundary when batch and offline groups are hidden', async () => {
    await renderDropdown({ canClear: true, canMarkAll: true, isOfflineItemsVisible: false })

    // history + destructive
    expect(countDividers()).toBe(2)
  })
})

describe('<PlaylistOfflineMenuItem>', () => {
  test('calls onPress when not disabled', async () => {
    const onPress = jest.fn()
    await render(<PlaylistOfflineMenuItem text='Cache' onPress={onPress} icon='cloud-download' />)

    fireEvent.press(screen.getByText('Cache'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  test('does not call onPress when disabled', async () => {
    const onPress = jest.fn()
    await render(
      <PlaylistOfflineMenuItem isDisabled text='Cache' onPress={onPress} icon='cloud-download' />,
    )

    fireEvent.press(screen.getByText('Cache'))

    expect(onPress).not.toHaveBeenCalled()
  })
})

describe('<PlaylistHistoryMenuItem>', () => {
  test('calls onPress', async () => {
    const onPress = jest.fn()
    await render(
      <PlaylistHistoryMenuItem text='Mark all' onPress={onPress} icon='checkmark-done' />,
    )

    fireEvent.press(screen.getByText('Mark all'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

describe('<PlaylistShareMenuItem>', () => {
  test('calls onPress when not disabled', async () => {
    const onPress = jest.fn()
    await render(<PlaylistShareMenuItem text='Share' onPress={onPress} />)

    fireEvent.press(screen.getByText('Share'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  test('does not call onPress when disabled', async () => {
    const onPress = jest.fn()
    await render(<PlaylistShareMenuItem isDisabled text='Share' onPress={onPress} />)

    fireEvent.press(screen.getByText('Share'))

    expect(onPress).not.toHaveBeenCalled()
  })
})
