import { createCtx } from '@reatom/framework'
import { act, fireEvent, waitFor } from '@testing-library/react-native'
import { View } from 'react-native'
import { type TestInstance } from 'test-renderer'
import { onboardingTargetRectsAtom, onboardingTourAtom } from 'features/onboarding/model'
import { type TrackCacheVisualState } from 'entities/offline-cache'
import { type PlaybackRate } from 'entities/player'
import { type AudioPlayerData } from 'entities/sermon'
import { renderWithProviders } from 'shared/mocks/renderWithProviders'
import { isOnlineAtom } from 'shared/model'
import { PlayerMenu } from './PlayerMenu'
import { PlayerMenuItems } from './PlayerMenuItems'
import { PlayerSpeedMenu } from './PlayerSpeedMenu'

jest.mock('expo-router', () => ({
  useNavigation: () => ({ addListener: jest.fn() }),
}))

const mockOnClose = jest.fn()
const mockOnShowDetails = jest.fn()
const mockOnToggleCache = jest.fn()
const mockSetPlaybackRate = jest.fn().mockResolvedValue(undefined)
const mockOnShowSpeed = jest.fn()
const mockOnOpenSoundSettings = jest.fn()
const mockOnSelect = jest.fn()
const mockOnBack = jest.fn()
const mockOnAddToPlaylist = jest.fn()
const mockOnRequestRemoveFromPlaylist = jest.fn()

const CLOUD_STATE: TrackCacheVisualState = 'cloud'

const MOCK_AUDIO: AudioPlayerData = {
  artist: 'Author',
  artwork: null,
  audioUrl: 'https://example.com/audio.mp3',
  id: 'sermon-1',
  title: 'Sermon',
}

jest.mock('entities/player', () => ({
  PLAYBACK_RATES: [0.75, 1, 1.25, 1.5, 2],
  usePlaybackRate: () => ({ rate: 1, setPlaybackRate: mockSetPlaybackRate }),
}))

const SPEED_LABEL = 'Скорость воспроизведения'
const SOUND_SETTINGS_LABEL = 'Настройки звука'
const ADD_TO_PLAYLIST_LABEL = 'Добавить в плейлист'
const REMOVE_FROM_PLAYLIST_LABEL = 'Удалить из текущего плейлиста и открыть в другом'
const DETAILS_TARGET_ID = 'player-fullscreen.menu-details'
const RECT = { height: 4, width: 3, x: 1, y: 2 }

const renderMenu = async ({
  canRemoveFromPlaylist = false,
}: {
  canRemoveFromPlaylist?: boolean
} = {}) =>
  renderWithProviders(
    <PlayerMenu
      audio={MOCK_AUDIO}
      onClose={mockOnClose}
      visualState={CLOUD_STATE}
      onShowDetails={mockOnShowDetails}
      onToggleCache={mockOnToggleCache}
      canRemoveFromPlaylist={canRemoveFromPlaylist}
      onOpenSoundSettings={mockOnOpenSoundSettings}
      onRequestRemoveFromPlaylist={mockOnRequestRemoveFromPlaylist}
    />,
  )

const triggerOnLayout = async (container: TestInstance) => {
  const layoutView = container.queryAll(node => node.props.onLayout !== undefined, {
    includeSelf: true,
  })[0]
  await act(async () => {
    fireEvent(layoutView, 'layout', {
      nativeEvent: { layout: { height: 200, width: 200, x: 0, y: 0 } },
    })
  })
}

describe('<PlayerMenu>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSetPlaybackRate.mockResolvedValue(undefined)
  })

  test('renders without crashing', async () => {
    const { toJSON } = await renderWithProviders(
      <PlayerMenu
        audio={MOCK_AUDIO}
        onClose={mockOnClose}
        visualState={CLOUD_STATE}
        canRemoveFromPlaylist={false}
        onShowDetails={mockOnShowDetails}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    expect(toJSON()).toBeTruthy()
  })

  test('add-to-playlist row opens the modal with the current sermon and closes the menu', async () => {
    const { container, getByText } = await renderWithProviders(
      <PlayerMenu
        audio={MOCK_AUDIO}
        onClose={mockOnClose}
        visualState={CLOUD_STATE}
        canRemoveFromPlaylist={false}
        onShowDetails={mockOnShowDetails}
        onToggleCache={mockOnToggleCache}
        onAddToPlaylist={mockOnAddToPlaylist}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )

    await triggerOnLayout(container)

    fireEvent.press(getByText(ADD_TO_PLAYLIST_LABEL))

    expect(mockOnAddToPlaylist).toHaveBeenCalledWith(MOCK_AUDIO)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('requesting removal calls the callback and closes the menu', async () => {
    const { container, getByText } = await renderMenu({ canRemoveFromPlaylist: true })

    await triggerOnLayout(container)

    fireEvent.press(getByText(REMOVE_FROM_PLAYLIST_LABEL))

    expect(mockOnRequestRemoveFromPlaylist).toHaveBeenCalledTimes(1)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('hides the remove item when the snapshot is not removable', async () => {
    const { queryByText } = await renderMenu({ canRemoveFromPlaylist: false })

    expect(queryByText(REMOVE_FROM_PLAYLIST_LABEL)).toBeNull()
  })

  test('selecting a rate calls setPlaybackRate before onClose', async () => {
    const { container, getByText } = await renderWithProviders(
      <PlayerMenu
        audio={MOCK_AUDIO}
        onClose={mockOnClose}
        visualState={CLOUD_STATE}
        canRemoveFromPlaylist={false}
        onShowDetails={mockOnShowDetails}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )

    await triggerOnLayout(container)

    const speedButton = await getByText(SPEED_LABEL)
    await act(async () => {
      fireEvent.press(speedButton)
    })

    const rate15 = await getByText('1.5x')
    await act(async () => {
      fireEvent.press(rate15)
    })

    expect(mockSetPlaybackRate).toHaveBeenCalledTimes(1)
    expect(mockSetPlaybackRate).toHaveBeenCalledWith(1.5)
    expect(mockOnClose).toHaveBeenCalledTimes(1)

    const setRateOrder = mockSetPlaybackRate.mock.invocationCallOrder[0]
    const onCloseOrder = mockOnClose.mock.invocationCallOrder[0]
    expect(setRateOrder).toBeLessThan(onCloseOrder)
  })

  test('pressing sound settings opens the sheet, then closes the menu', async () => {
    const { container, getByText } = await renderWithProviders(
      <PlayerMenu
        audio={MOCK_AUDIO}
        onClose={mockOnClose}
        visualState={CLOUD_STATE}
        canRemoveFromPlaylist={false}
        onShowDetails={mockOnShowDetails}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )

    await triggerOnLayout(container)

    await act(async () => {
      fireEvent.press(getByText(SOUND_SETTINGS_LABEL))
    })

    expect(mockOnOpenSoundSettings).toHaveBeenCalledTimes(1)

    const openOrder = mockOnOpenSoundSettings.mock.invocationCallOrder[0]
    const onCloseOrder = mockOnClose.mock.invocationCallOrder[0]
    expect(openOrder).toBeLessThan(onCloseOrder)
  })
})

describe('<PlayerMenuItems>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('shows speed row with current rate', async () => {
    const { getByText } = await renderWithProviders(
      <PlayerMenuItems
        rate={1}
        visualState={CLOUD_STATE}
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    expect(getByText('Скорость воспроизведения')).toBeTruthy()
    expect(getByText('1x')).toBeTruthy()
  })

  test('shows non-1 rate value correctly', async () => {
    const { getByText } = await renderWithProviders(
      <PlayerMenuItems
        rate={1.5}
        visualState={CLOUD_STATE}
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    expect(getByText('1.5x')).toBeTruthy()
  })

  test('pressing speed row calls onShowSpeed', async () => {
    const { getByRole } = await renderWithProviders(
      <PlayerMenuItems
        rate={1}
        visualState={CLOUD_STATE}
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    fireEvent.press(getByRole('button', { name: SPEED_LABEL }))
    expect(mockOnShowSpeed).toHaveBeenCalledTimes(1)
  })

  test('sound settings row is active and calls onOpenSoundSettings', async () => {
    const { getByRole } = await renderWithProviders(
      <PlayerMenuItems
        rate={1}
        visualState={CLOUD_STATE}
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    fireEvent.press(getByRole('button', { name: SOUND_SETTINGS_LABEL }))
    expect(mockOnOpenSoundSettings).toHaveBeenCalledTimes(1)
  })

  test('pressing details calls onDetails', async () => {
    const { getByText } = await renderWithProviders(
      <PlayerMenuItems
        rate={1}
        visualState={CLOUD_STATE}
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    fireEvent.press(getByText('Подробнее'))
    expect(mockOnShowDetails).toHaveBeenCalledTimes(1)
  })

  test('add-to-playlist row is active and calls onAddToPlaylist when provided', async () => {
    const { getByText } = await renderWithProviders(
      <PlayerMenuItems
        rate={1}
        visualState={CLOUD_STATE}
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onAddToPlaylist={mockOnAddToPlaylist}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    fireEvent.press(getByText(ADD_TO_PLAYLIST_LABEL))
    expect(mockOnAddToPlaylist).toHaveBeenCalledTimes(1)
  })

  test('add-to-playlist row is disabled when no handler is provided', async () => {
    const { getByText } = await renderWithProviders(
      <PlayerMenuItems
        rate={1}
        visualState={CLOUD_STATE}
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    fireEvent.press(getByText(ADD_TO_PLAYLIST_LABEL))
    expect(mockOnAddToPlaylist).not.toHaveBeenCalled()
  })

  test('does not call onToggleCache when offline and not cached', async () => {
    const { ctx, getByText } = await renderWithProviders(
      <PlayerMenuItems
        rate={1}
        visualState={CLOUD_STATE}
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    await act(async () => {
      isOnlineAtom(ctx, false)
    })
    fireEvent.press(getByText('Добавить в офлайн'))
    expect(mockOnToggleCache).not.toHaveBeenCalled()
  })

  test('calls onToggleCache when offline and cached (remove)', async () => {
    const { ctx, getByText } = await renderWithProviders(
      <PlayerMenuItems
        rate={1}
        isCached
        visualState='cached'
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    await act(async () => {
      isOnlineAtom(ctx, false)
    })
    fireEvent.press(getByText('Удалить из офлайн'))
    expect(mockOnToggleCache).toHaveBeenCalledTimes(1)
  })

  test('shows stop caching label when downloading', async () => {
    const { getByText } = await renderWithProviders(
      <PlayerMenuItems
        rate={1}
        visualState='downloading'
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    expect(getByText('Остановить добавление в офлайн')).toBeTruthy()
  })

  test('shows remove from queue label when queued', async () => {
    const { getByText } = await renderWithProviders(
      <PlayerMenuItems
        rate={1}
        visualState='queued'
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    expect(getByText('Убрать из очереди')).toBeTruthy()
  })

  test('stop caching stays enabled when offline', async () => {
    const { ctx, getByText } = await renderWithProviders(
      <PlayerMenuItems
        rate={1}
        visualState='downloading'
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
    )
    await act(async () => {
      isOnlineAtom(ctx, false)
    })
    fireEvent.press(getByText('Остановить добавление в офлайн'))
    expect(mockOnToggleCache).toHaveBeenCalledTimes(1)
  })

  const mockMeasureInWindow = () =>
    jest
      .spyOn(View.prototype, 'measureInWindow')
      .mockImplementation((cb: (x: number, y: number, width: number, height: number) => void) => {
        cb(RECT.x, RECT.y, RECT.width, RECT.height)
        return undefined
      })

  const renderMenuItems = (ctx: ReturnType<typeof createCtx>) =>
    renderWithProviders(
      <PlayerMenuItems
        rate={1}
        visualState={CLOUD_STATE}
        onDetails={mockOnShowDetails}
        onShowSpeed={mockOnShowSpeed}
        onToggleCache={mockOnToggleCache}
        onOpenSoundSettings={mockOnOpenSoundSettings}
      />,
      { ctx },
    )

  test('registers the details target rect while its tour step is active', async () => {
    mockMeasureInWindow()
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'player-description', stepIndex: 1 })

    await renderMenuItems(ctx)

    await waitFor(() => expect(ctx.get(onboardingTargetRectsAtom)[DETAILS_TARGET_ID]).toEqual(RECT))
  })

  test('registers the speed menu target rect while its tour step is active', async () => {
    mockMeasureInWindow()
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'player-speed', stepIndex: 1 })

    await renderMenuItems(ctx)

    await waitFor(() =>
      expect(ctx.get(onboardingTargetRectsAtom)['player-fullscreen.menu-speed']).toEqual(RECT),
    )
  })

  test('registers the sound menu target rect while its tour step is active', async () => {
    mockMeasureInWindow()
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: 'player-sound', stepIndex: 1 })

    await renderMenuItems(ctx)

    await waitFor(() =>
      expect(ctx.get(onboardingTargetRectsAtom)['player-fullscreen.menu-sound']).toEqual(RECT),
    )
  })
})

describe('<PlayerSpeedMenu>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const RATE_LIST: PlaybackRate[] = [0.75, 1, 1.25, 1.5, 2]

  test('shows all rates', async () => {
    const { getByText } = await renderWithProviders(
      <PlayerSpeedMenu currentRate={1} onBack={mockOnBack} onSelect={mockOnSelect} />,
    )
    for (const rate of RATE_LIST) expect(getByText(`${rate}x`)).toBeTruthy()
  })

  test('back button calls onBack', async () => {
    const { getByLabelText } = await renderWithProviders(
      <PlayerSpeedMenu currentRate={1} onBack={mockOnBack} onSelect={mockOnSelect} />,
    )
    fireEvent.press(getByLabelText('Назад'))
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  test('selecting a rate calls onSelect with that rate', async () => {
    const { getByText } = await renderWithProviders(
      <PlayerSpeedMenu currentRate={1} onBack={mockOnBack} onSelect={mockOnSelect} />,
    )
    fireEvent.press(getByText('1.5x'))
    expect(mockOnSelect).toHaveBeenCalledWith(1.5)
  })

  test('selecting current rate still calls onSelect', async () => {
    const { getByText } = await renderWithProviders(
      <PlayerSpeedMenu currentRate={1} onBack={mockOnBack} onSelect={mockOnSelect} />,
    )
    fireEvent.press(getByText('1x'))
    expect(mockOnSelect).toHaveBeenCalledWith(1)
  })

  test('active rate row has selected state', async () => {
    const { getByLabelText } = await renderWithProviders(
      <PlayerSpeedMenu currentRate={1} onBack={mockOnBack} onSelect={mockOnSelect} />,
    )
    const activeRow = getByLabelText('Скорость 1x')
    expect(activeRow).toBeSelected()

    const inactiveRow = getByLabelText('Скорость 1.5x')
    expect(inactiveRow).not.toBeSelected()
  })
})
