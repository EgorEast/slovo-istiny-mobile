import { createCtx } from '@reatom/framework'
import { act, waitFor } from '@testing-library/react-native'
import { useSyncExternalStore } from 'react'
import { renderHookWithProviders } from 'shared/mocks/renderWithProviders'
import { type OnboardingTargetRect, onboardingTargetRectsAtom } from '../model/targets'
import {
  goToPrevOnboardingStep,
  onboardingEntryStepIndexAtom,
  onboardingTourAtom,
} from '../model/tour'
import { type OnboardingScenario, scenariosById } from './scenarios'
import { buildTourDeck } from './tourDeck'
import { useStepNavigation } from './useStepNavigation'

const mockUseSyncExternalStore = useSyncExternalStore

const mockPathnameListeners = new Set<() => void>()
let mockCurrentPathname = '/listen'
const mockPathnameStore = {
  get: () => mockCurrentPathname,
  set: (next: string) => {
    mockCurrentPathname = next
    mockPathnameListeners.forEach(listener => listener())
  },
  subscribe: (listener: () => void) => {
    mockPathnameListeners.add(listener)
    return () => {
      mockPathnameListeners.delete(listener)
    }
  },
}

// A reactive pathname: the router mock moves the store, so the hook re-renders when
// navigation lands — the real router does the same.
jest.mock('expo-router', () => ({
  usePathname: () => mockUseSyncExternalStore(mockPathnameStore.subscribe, mockPathnameStore.get),
  useRouter: () => ({ navigate: (route: string) => mockPathnameStore.set(route) }),
}))

const TARGET_RECT: OnboardingTargetRect = { height: 4, width: 3, x: 1, y: 2 }
const ENTRY_SCENARIO_ID = 'backup'
const ENTRY_RECTS = { 'more.share-item': TARGET_RECT, 'tab.more': TARGET_RECT }
const BLINK_BUDGET_MS = 15000

const entryScenario: OnboardingScenario = {
  description: '',
  icon: 'information-circle-outline',
  id: ENTRY_SCENARIO_ID,
  steps: [
    { text: '', title: 'Интро' },
    { route: '/more', tapTargetId: 'tab.more', text: '', title: 'Ещё' },
    { route: '/share', tapTargetId: 'more.share-item', text: '', title: 'Поделиться' },
    { route: '/share', targetId: 'share.qr', text: '', title: 'QR' },
    { text: '', title: 'Финал' },
  ],
  title: '',
}

const renderEntryNavigation = (deckIndex: number, pathname: string) => {
  const ctx = createCtx()
  const deck = buildTourDeck(entryScenario.steps)
  const entry = deck[deckIndex]
  mockPathnameStore.set(pathname)
  onboardingTourAtom(ctx, { deckIndex, scenarioId: ENTRY_SCENARIO_ID, skippedDeckIndexes: [] })
  onboardingTargetRectsAtom(ctx, ENTRY_RECTS)
  onboardingEntryStepIndexAtom(ctx, 0)

  return renderHookWithProviders(
    () =>
      useStepNavigation({
        bottomInset: 0,
        cardStep: entryScenario.steps[entry.cardIndex],
        deckIndex,
        entry,
        isLastVisible: deckIndex === deck.length - 1,
        isTourActive: true,
        scenario: entryScenario,
        stepKey: `${ENTRY_SCENARIO_ID}:${deckIndex}`,
        viewportHeight: 800,
      }),
    { ctx },
  )
}

describe('useStepNavigation entry transitions', () => {
  const originalScenario = scenariosById[ENTRY_SCENARIO_ID]

  beforeEach(() => {
    scenariosById[ENTRY_SCENARIO_ID] = entryScenario
  })

  afterEach(() => {
    scenariosById[ENTRY_SCENARIO_ID] = originalScenario
    mockPathnameStore.set('/listen')
  })

  test(
    'blinks each entry transition forward, then lands on the card',
    async () => {
      const { ctx, result } = await renderEntryNavigation(1, '/listen')

      // The first entry holds navigation while its blink plays on the live tab.
      expect(result.current.holdNavigation).toBe(true)
      expect(ctx.get(onboardingEntryStepIndexAtom)).toBe(0)

      await waitFor(() => expect(ctx.get(onboardingEntryStepIndexAtom)).toBeNull(), {
        timeout: 8000,
      })
      expect(ctx.get(onboardingTourAtom)?.deckIndex).toBe(1)
      expect(mockCurrentPathname).toBe('/share')
    },
    BLINK_BUDGET_MS,
  )

  test('skips every entry instantly when the card screen is already reached', async () => {
    const { ctx, result } = await renderEntryNavigation(1, '/share')

    await waitFor(() => expect(ctx.get(onboardingEntryStepIndexAtom)).toBeNull(), {
      timeout: 1000,
    })
    expect(result.current.holdNavigation).toBe(false)
    expect(mockCurrentPathname).toBe('/share')
  })

  test('«Назад» lands on the previous card without replaying the entry phase', async () => {
    const { ctx } = await renderEntryNavigation(1, '/listen')

    await act(async () => {
      goToPrevOnboardingStep(ctx)
    })

    expect(ctx.get(onboardingTourAtom)?.deckIndex).toBe(0)
    expect(ctx.get(onboardingEntryStepIndexAtom)).toBeNull()
  })
})
