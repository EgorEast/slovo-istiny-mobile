import { createCtx } from '@reatom/framework'
import { act, fireEvent, type screen, waitFor } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { currentAudioAtom } from 'entities/player/@x/onboarding'
import { renderWithProviders } from 'shared/mocks'
import { registerTourAction, unregisterTourAction } from '../lib/tourActions'
import {
  type OnboardingTargetRect,
  onboardingTargetRectsAtom,
  registerOnboardingTargetRect,
} from '../model/targets'
import { endOnboardingTour, onboardingStepDirectionAtom, onboardingTourAtom } from '../model/tour'
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

jest.mock('./TapIndicator', () => {
  const { Text } = jest.requireActual('react-native')

  return { TapIndicator: () => <Text>tap-indicator</Text> }
})

jest.mock('./TourDim', () => {
  const { Text, View } = jest.requireActual('react-native')

  return {
    TourDim: ({ holes }: { holes: Array<{ x: number; y: number }> }) => (
      <View>
        <Text>tour-dim</Text>
        {holes.map(hole => (
          <Text key={`${hole.x}-${hole.y}`}>{`hole:${hole.x},${hole.y}`}</Text>
        ))}
      </View>
    ),
  }
})

const mockNavigate = jest.fn()
const mockPathname = jest.fn(() => '/listen')

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ navigate: mockNavigate }),
}))

const AUDIO = {
  artist: 'Проповедник',
  artwork: null,
  audioUrl: 'https://example.com/sermon.mp3',
  id: 'sermon-1',
  title: 'Проповедь',
}
const NEXT_LABEL = 'Далее'
const HINT = 'Выполните действие, чтобы продолжить'
const TAP_INDICATOR = 'tap-indicator'
const DIM = 'tour-dim'
const MISSING_TARGET_TIMEOUT_MS = 1200
const TAP_PHASE_TIMEOUT_MS = 3500
const HOLD_TIMEOUT_MS = 1200
const SECTIONS_RECT: OnboardingTargetRect = { height: 4, width: 3, x: 1, y: 2 }
const OFFSCREEN_RECT: OnboardingTargetRect = { height: 60, width: 300, x: 0, y: 99999 }
const TAB_MORE_RECT: OnboardingTargetRect = { height: 60, width: 90, x: 300, y: 760 }
const EDGE_BACK_RECT: OnboardingTargetRect = { height: 400, width: 64, x: 0, y: 100 }
const EDGE_FORWARD_RECT: OnboardingTargetRect = { height: 400, width: 64, x: 336, y: 100 }
const PLAYLIST_ROW_RECT: OnboardingTargetRect = { height: 80, width: 320, x: 0, y: 400 }
const PLAYLIST_FIRST_ROW = 'playlist.first-row'
const PLAYLIST_ROW_MENU_ADD = 'playlist.row-menu-add'
const PLAYLIST_ADD_ROW_ACTION = 'open-playlist-row-menu'
const AREA_HIGHLIGHT = 'onboarding-area-highlight'
const TOUR_MODAL = 'onboarding-tour-modal'
const TAP_MODAL = 'onboarding-tap-modal'

// Walks up from a card node to the absolutely-positioned pass-through card and
// reads the `top` anchoring offset set from the active target's hole.
const findAnchoredCardTop = (node: ReturnType<typeof screen.getByText>) => {
  let current = node.parent

  while (current !== null) {
    const style = StyleSheet.flatten(current.props.style)
    if (style?.position === 'absolute' && typeof style.top === 'number') return style.top
    current = current.parent
  }

  return null
}

const renderAtStep = (
  scenarioId:
    | 'listen'
    | 'player-intro'
    | 'player'
    | 'playlist-add'
    | 'playlist-menu'
    | 'playlists'
    | 'search'
    | 'settings',
  stepIndex: number,
  rects: Record<string, OnboardingTargetRect> = {},
  setup?: (ctx: ReturnType<typeof createCtx>) => void,
) => {
  const ctx = createCtx()
  onboardingTourAtom(ctx, { scenarioId, skippedIndexes: [], stepIndex })
  onboardingTargetRectsAtom(ctx, rects)
  setup?.(ctx)

  return renderWithProviders(<OnboardingTourOverlay />, { ctx })
}

describe('<OnboardingTourOverlay>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname.mockReturnValue('/listen')
  })

  test('renders nothing without an active tour', async () => {
    const { queryByText } = await renderWithProviders(<OnboardingTourOverlay />)

    expect(queryByText(NEXT_LABEL)).toBeNull()
  })

  test('renders the current step with next and close controls when the rect is ready', async () => {
    const { getByRole, getByText } = await renderAtStep('listen', 0, {
      'listen.sections': SECTIONS_RECT,
    })

    expect(getByText('Разделы проповедей')).toBeTruthy()
    expect(getByText(NEXT_LABEL)).toBeTruthy()
    expect(getByRole('button', { name: 'Завершить обзор' })).toBeTruthy()
  })

  test('renders a targetless step as a card with a back button on its inherited route', async () => {
    mockPathname.mockReturnValue('/listen/my-playlists')

    const { getByText } = await renderAtStep('playlists', 2)

    expect(getByText('Добавить проповедь')).toBeTruthy()
    expect(getByText('Назад')).toBeTruthy()
  })

  test('shows the done label on the last step', async () => {
    mockPathname.mockReturnValue('/listen/my-playlists')

    const { getByText, queryByText } = await renderAtStep('playlists', 2)

    expect(getByText('Готово')).toBeTruthy()
    expect(queryByText(NEXT_LABEL)).toBeNull()
  })

  test('ends the tour when the primary button is pressed on the last step', async () => {
    mockPathname.mockReturnValue('/listen/my-playlists')

    const { ctx, getByText } = await renderAtStep('playlists', 2)

    fireEvent.press(getByText('Готово'))

    expect(ctx.get(onboardingTourAtom)).toBeNull()
  })

  test('advances to the next step when the primary button is pressed on a non-last step', async () => {
    const { ctx, getByText } = await renderAtStep('listen', 0, {
      'listen.sections': SECTIONS_RECT,
    })

    fireEvent.press(getByText(NEXT_LABEL))

    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: 'listen',
      skippedIndexes: [],
      stepIndex: 1,
    })
  })

  test('navigates to the step route when the pathname differs', async () => {
    mockPathname.mockReturnValue('/settings')

    await renderAtStep('settings', 1)

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/more'), {
      timeout: HOLD_TIMEOUT_MS,
    })
  })

  test('renders nothing while the router is moving to the effective route', async () => {
    mockPathname.mockReturnValue('/listen')

    const { queryByText } = await renderAtStep('playlists', 2)

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/listen/my-playlists'))
    expect(queryByText('Добавить проповедь')).toBeNull()
  })

  test('blinks the tap hint inside its own modal before navigating', async () => {
    mockPathname.mockReturnValue('/settings')

    const { getByTestId, getByText, queryByText } = await renderAtStep('settings', 1, {
      'tab.more': TAB_MORE_RECT,
    })

    // The blink is presented in a Modal (a fresh native window above app overlays):
    // the hint shows inside it, the dim/tooltip do not.
    expect(getByTestId(TAP_MODAL)).toBeTruthy()
    expect(getByText(TAP_INDICATOR)).toBeTruthy()
    expect(queryByText(NEXT_LABEL)).toBeNull()

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/more'), {
      timeout: TAP_PHASE_TIMEOUT_MS,
    })
  })

  test('presents an action step blink inside the keyed modal', async () => {
    const { getByTestId, getByText } = await renderAtStep('playlist-add', 1, {
      [PLAYLIST_FIRST_ROW]: PLAYLIST_ROW_RECT,
    })

    expect(getByTestId(TAP_MODAL)).toBeTruthy()
    expect(getByText(TAP_INDICATOR)).toBeTruthy()
  })

  test('holds navigation for a declared tap target until its rect registers, then blinks', async () => {
    mockPathname.mockReturnValue('/settings')

    const { ctx, queryByTestId, queryByText } = await renderAtStep('settings', 1)

    // No rect yet: navigation is held and no blink plays.
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(queryByText(TAP_INDICATOR)).toBeNull()
    expect(queryByTestId(TAP_MODAL)).toBeNull()

    await act(async () => {
      registerOnboardingTargetRect(ctx, { id: 'tab.more', rect: TAB_MORE_RECT })
    })

    await waitFor(() => expect(queryByTestId(TAP_MODAL)).toBeTruthy())
    await waitFor(() => expect(queryByText(TAP_INDICATOR)).toBeTruthy())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/more'), {
      timeout: TAP_PHASE_TIMEOUT_MS,
    })
  })

  test('navigates without a blink when the declared tap target never registers', async () => {
    mockPathname.mockReturnValue('/settings')

    const { queryByText } = await renderAtStep('settings', 1)

    expect(queryByText(TAP_INDICATOR)).toBeNull()
    expect(mockNavigate).not.toHaveBeenCalled()

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/more'), {
      timeout: HOLD_TIMEOUT_MS,
    })
    expect(queryByText(TAP_INDICATOR)).toBeNull()
  })

  test('cancels the tap phase without navigating when the user reaches the route first', async () => {
    mockPathname.mockReturnValue('/settings')

    const { getByText, queryByText, rerender } = await renderAtStep('settings', 1, {
      'tab.more': TAB_MORE_RECT,
    })

    expect(getByText(TAP_INDICATOR)).toBeTruthy()

    mockPathname.mockReturnValue('/more')
    await act(async () => {
      rerender(<OnboardingTourOverlay />)
    })

    expect(queryByText(TAP_INDICATOR)).toBeNull()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('clears the tap phase when the tour ends', async () => {
    mockPathname.mockReturnValue('/settings')

    const { ctx, getByText, queryByText } = await renderAtStep('settings', 1, {
      'tab.more': TAB_MORE_RECT,
    })

    expect(getByText(TAP_INDICATOR)).toBeTruthy()

    await act(async () => {
      endOnboardingTour(ctx)
    })

    await waitFor(() => expect(queryByText(TAP_INDICATOR)).toBeNull())
  })

  test('shows the real step count and the done label when trailing menu steps are absent', async () => {
    const MENU_RECT: OnboardingTargetRect = { height: 40, width: 200, x: 10, y: 300 }

    // A server playlist hides publish/clear/delete, so the deck is 8 steps long and
    // the interactive sermon-menu step (index 10) is its last visible one.
    const { getByText, queryByText } = await renderAtStep('playlist-menu', 10, {
      'playlist.menu-add-all': MENU_RECT,
      'playlist.menu-history-mark': MENU_RECT,
      'playlist.menu-offline-add': MENU_RECT,
      'playlist.menu-offline-remove': MENU_RECT,
      'playlist.menu-share': MENU_RECT,
    })

    expect(getByText('Шаг 8 из 8')).toBeTruthy()
    expect(getByText('Готово')).toBeTruthy()
    expect(queryByText(NEXT_LABEL)).toBeNull()
  })

  test('renders a centered card when the registered rect is below the viewport', async () => {
    const { getByText } = await renderAtStep('listen', 3, {
      'listen.my-playlists': OFFSCREEN_RECT,
    })

    expect(getByText('Мои плейлисты')).toBeTruthy()
  })

  test('blocks the app under a registered area step with a spotlight modal', async () => {
    const { getAllByTestId, getByTestId, getByText } = await renderAtStep('player-intro', 0, {
      'player-fullscreen.edge-back': EDGE_BACK_RECT,
      'player-fullscreen.edge-forward': EDGE_FORWARD_RECT,
    })

    // The blocking modal tree is used, not the pass-through TourWaitLayer: the app
    // underneath is unreachable, so the card buttons cannot fall through.
    expect(getByTestId(TOUR_MODAL)).toBeTruthy()
    expect(getAllByTestId(AREA_HIGHLIGHT)).toHaveLength(2)
    expect(getByText(DIM)).toBeTruthy()
    expect(getByText('hole:0,100')).toBeTruthy()
    expect(getByText('hole:336,100')).toBeTruthy()
    expect(getByText('Края экрана')).toBeTruthy()
    expect(getByText(NEXT_LABEL)).toBeTruthy()
  })

  test('advances from an area step when the primary button is pressed', async () => {
    const { ctx, getByText } = await renderAtStep('player-intro', 0, {
      'player-fullscreen.edge-back': EDGE_BACK_RECT,
      'player-fullscreen.edge-forward': EDGE_FORWARD_RECT,
    })

    fireEvent.press(getByText(NEXT_LABEL))

    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: 'player-intro',
      skippedIndexes: [],
      stepIndex: 1,
    })
  })

  test('renders the area step card centered while no area rect has registered', async () => {
    const { getByTestId, getByText, queryAllByTestId, queryByText } = await renderAtStep(
      'player-intro',
      0,
    )

    expect(getByTestId(TOUR_MODAL)).toBeTruthy()
    expect(queryAllByTestId(AREA_HIGHLIGHT)).toHaveLength(0)
    expect(getByText('Края экрана')).toBeTruthy()
    expect(getByText(DIM)).toBeTruthy()
    expect(queryByText(/^hole:/)).toBeNull()
  })

  test('cuts a hole only for the registered area rects of the step', async () => {
    const { getAllByTestId, getByText, queryByText } = await renderAtStep('player-intro', 0, {
      'player-fullscreen.edge-back': EDGE_BACK_RECT,
    })

    expect(getAllByTestId(AREA_HIGHLIGHT)).toHaveLength(1)
    expect(getByText('hole:0,100')).toBeTruthy()
    expect(queryByText('hole:336,100')).toBeNull()
  })

  test('renders an interactive step as a pass-through card without a spotlight modal', async () => {
    const { getByText, queryByTestId, queryByText } = await renderAtStep('search', 5)

    expect(queryByTestId(TOUR_MODAL)).toBeNull()
    expect(getByText('Выберите плейлист')).toBeTruthy()
    expect(getByText(NEXT_LABEL)).toBeTruthy()
    expect(queryByText(DIM)).toBeNull()
  })

  test('keeps an interactive step with a target pass-through and anchors its card to the target', async () => {
    const ROW_RECT: OnboardingTargetRect = { height: 80, width: 320, x: 0, y: 400 }

    const { getByTestId, getByText, queryByTestId, queryByText } = await renderAtStep(
      'playlist-menu',
      10,
      { 'playlist.first-row': ROW_RECT },
    )

    // An interactive step owns the pass-through layer even with a targetId: the
    // target only positions the card, no spotlight modal or dim is shown.
    expect(queryByTestId(TOUR_MODAL)).toBeNull()
    expect(queryByText(DIM)).toBeNull()
    // Its areaTargetIds still mark the zone with the translucent fill.
    expect(getByTestId(AREA_HIGHLIGHT)).toBeTruthy()
    expect(getByText('Меню проповеди')).toBeTruthy()
    // Anchored above the row instead of centered on the screen.
    expect(findAnchoredCardTop(getByText('Меню проповеди'))).toBeLessThan(ROW_RECT.y)
  })

  test('performs the step actionOnEnterId once on activation, not on re-render', async () => {
    const action = jest.fn()
    registerTourAction('close-playlist-menu', action)

    const ROW_RECT: OnboardingTargetRect = { height: 80, width: 320, x: 0, y: 400 }
    const { rerender } = await renderAtStep('playlist-menu', 10, {
      'playlist.first-row': ROW_RECT,
    })

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1))

    await act(async () => {
      rerender(<OnboardingTourOverlay />)
    })
    expect(action).toHaveBeenCalledTimes(1)

    unregisterTourAction('close-playlist-menu')
  })

  test('keeps the tooltip hidden until the missing-target timeout expires', async () => {
    const { getByText, queryByText } = await renderAtStep('listen', 0)

    expect(queryByText(NEXT_LABEL)).toBeNull()

    await waitFor(() => expect(getByText(NEXT_LABEL)).toBeTruthy(), {
      timeout: MISSING_TARGET_TIMEOUT_MS * 2,
    })
  })

  test('shows the wait card without a modal dim while the condition is unmet', async () => {
    const { getByRole, getByText, queryByText } = await renderAtStep('player', 0, {
      'listen.sections': SECTIONS_RECT,
    })

    expect(getByText(HINT)).toBeTruthy()
    expect(getByRole('button', { name: 'Завершить обзор' })).toBeTruthy()
    expect(queryByText(NEXT_LABEL)).toBeNull()
    expect(queryByText(DIM)).toBeNull()
  })

  test('returns the modal with the primary button once the wait condition is satisfied', async () => {
    const { getByText, queryByText } = await renderAtStep(
      'player',
      0,
      { 'listen.sections': SECTIONS_RECT },
      ctx => currentAudioAtom(ctx, AUDIO),
    )

    expect(queryByText(HINT)).toBeNull()
    expect(getByText(NEXT_LABEL)).toBeTruthy()
    expect(getByText(DIM)).toBeTruthy()
  })

  test('returns to the intro card when going back from the row-menu step', async () => {
    const action = jest.fn()
    registerTourAction(PLAYLIST_ADD_ROW_ACTION, action)

    const { ctx, getByText } = await renderAtStep('playlist-add', 2, {
      [PLAYLIST_FIRST_ROW]: PLAYLIST_ROW_RECT,
      [PLAYLIST_ROW_MENU_ADD]: PLAYLIST_ROW_RECT,
    })

    fireEvent.press(getByText('Назад'))

    // Step 1 is the forward-only action step: «Назад» steps over it to the intro.
    await waitFor(() => expect(getByText('Добавление в плейлист')).toBeTruthy())
    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: 'playlist-add',
      skippedIndexes: [],
      stepIndex: 0,
    })
    expect(action).not.toHaveBeenCalled()
    unregisterTourAction(PLAYLIST_ADD_ROW_ACTION)
  })

  test('performs the row-menu action after the intro step and advances', async () => {
    const action = jest.fn()
    registerTourAction(PLAYLIST_ADD_ROW_ACTION, action)

    const { ctx, getByText } = await renderAtStep('playlist-add', 0, {
      [PLAYLIST_FIRST_ROW]: PLAYLIST_ROW_RECT,
    })

    fireEvent.press(getByText(NEXT_LABEL))

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1), {
      timeout: TAP_PHASE_TIMEOUT_MS + 1500,
    })
    await waitFor(
      () =>
        expect(ctx.get(onboardingTourAtom)).toEqual({
          scenarioId: 'playlist-add',
          skippedIndexes: [],
          stepIndex: 2,
        }),
      { timeout: TAP_PHASE_TIMEOUT_MS + 1500 },
    )
    unregisterTourAction(PLAYLIST_ADD_ROW_ACTION)
  })

  test('shows an action step entered backward statically and advances without re-performing', async () => {
    const action = jest.fn()
    registerTourAction(PLAYLIST_ADD_ROW_ACTION, action)

    const { ctx, getByText } = await renderAtStep(
      'playlist-add',
      1,
      { [PLAYLIST_FIRST_ROW]: PLAYLIST_ROW_RECT },
      setupCtx => onboardingStepDirectionAtom(setupCtx, 'backward'),
    )

    // A backward entry shows the static card: no blink, no action, no auto-advance.
    expect(getByText('Меню проповеди')).toBeTruthy()
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 800))
    })
    expect(action).not.toHaveBeenCalled()

    fireEvent.press(getByText(NEXT_LABEL))

    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: 'playlist-add',
      skippedIndexes: [],
      stepIndex: 2,
    })
    expect(action).not.toHaveBeenCalled()
    unregisterTourAction(PLAYLIST_ADD_ROW_ACTION)
  })
})
