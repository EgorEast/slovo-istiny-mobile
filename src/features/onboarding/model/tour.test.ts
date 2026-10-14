import { createCtx } from '@reatom/framework'
import { scenariosById } from '../lib/scenarios'
import { buildTourDeck, resolveDeckProgress } from '../lib/tourDeck'
import { onboardingTargetRectsAtom, registerOnboardingTargetRect } from './targets'
import {
  endOnboardingTour,
  goToNextOnboardingStep,
  goToPrevOnboardingStep,
  onboardingExitStepIndexAtom,
  onboardingStepDirectionAtom,
  onboardingTourAtom,
  skipOnboardingStep,
  startOnboardingTour,
} from './tour'

const RECT = { height: 4, width: 3, x: 1, y: 2 }
const PLAYLIST_MENU = 'playlist-menu'
const PLAYLIST_MENU_DECK = buildTourDeck(scenariosById[PLAYLIST_MENU].steps)

describe('onboarding tour model', () => {
  test('start sets the first card and wipes previous rects', () => {
    const ctx = createCtx()
    onboardingTargetRectsAtom(ctx, { target: RECT })
    onboardingExitStepIndexAtom(ctx, 0)

    startOnboardingTour(ctx, 'listen', '/')

    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 0,
      scenarioId: 'listen',
      skippedDeckIndexes: [],
    })
    expect(ctx.get(onboardingExitStepIndexAtom)).toBeNull()
    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })

  test('next advances the deck and clamps at the last card', () => {
    const ctx = createCtx()
    startOnboardingTour(ctx, 'listen', '/')

    for (let press = 0; press < 8; press += 1) goToNextOnboardingStep(ctx)

    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 4,
      scenarioId: 'listen',
      skippedDeckIndexes: [],
    })
  })

  test('prev goes back and clamps at the first card', () => {
    const ctx = createCtx()
    startOnboardingTour(ctx, 'listen', '/')
    goToNextOnboardingStep(ctx)

    goToPrevOnboardingStep(ctx)
    goToPrevOnboardingStep(ctx)

    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 0,
      scenarioId: 'listen',
      skippedDeckIndexes: [],
    })
  })

  test('prev from a card after an action card lands on the previous card', () => {
    const ctx = createCtx()
    // playlist-add deck: 0 — intro, 1 — menu-add card (its action exit), 2 — favorites…
    onboardingTourAtom(ctx, { deckIndex: 1, scenarioId: 'playlist-add', skippedDeckIndexes: [] })

    goToPrevOnboardingStep(ctx)

    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 0,
      scenarioId: 'playlist-add',
      skippedDeckIndexes: [],
    })
  })

  test('next starts a card exit transition before moving the deck', () => {
    const ctx = createCtx()
    startOnboardingTour(ctx, 'playlist-add', '/')

    goToNextOnboardingStep(ctx)

    // The intro card's visualization (step 1) plays first; the deck has not moved.
    expect(ctx.get(onboardingExitStepIndexAtom)).toBe(0)
    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 0,
      scenarioId: 'playlist-add',
      skippedDeckIndexes: [],
    })

    goToNextOnboardingStep(ctx)

    expect(ctx.get(onboardingExitStepIndexAtom)).toBeNull()
    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 1,
      scenarioId: 'playlist-add',
      skippedDeckIndexes: [],
    })
  })

  test('plays consecutive exits in order before advancing the deck', () => {
    const ctx = createCtx()
    // search deck: card 0 owns two visualizations (steps 1 and 2).
    startOnboardingTour(ctx, 'search', '/')

    goToNextOnboardingStep(ctx)
    expect(ctx.get(onboardingExitStepIndexAtom)).toBe(0)

    goToNextOnboardingStep(ctx)
    expect(ctx.get(onboardingExitStepIndexAtom)).toBe(1)

    goToNextOnboardingStep(ctx)
    expect(ctx.get(onboardingExitStepIndexAtom)).toBeNull()
    expect(ctx.get(onboardingTourAtom)?.deckIndex).toBe(1)
  })

  test('prev leaves the exit transition and never replays it', () => {
    const ctx = createCtx()
    startOnboardingTour(ctx, 'playlist-add', '/')
    goToNextOnboardingStep(ctx)
    goToNextOnboardingStep(ctx)

    goToNextOnboardingStep(ctx)
    expect(ctx.get(onboardingExitStepIndexAtom)).toBe(0)

    goToPrevOnboardingStep(ctx)

    expect(ctx.get(onboardingExitStepIndexAtom)).toBeNull()
    expect(ctx.get(onboardingTourAtom)?.deckIndex).toBe(0)
  })

  test('records the last step direction for the tap flow', () => {
    const ctx = createCtx()
    startOnboardingTour(ctx, 'playlist-add', '/')
    expect(ctx.get(onboardingStepDirectionAtom)).toBe('forward')

    goToNextOnboardingStep(ctx)
    expect(ctx.get(onboardingStepDirectionAtom)).toBe('forward')

    goToNextOnboardingStep(ctx)
    expect(ctx.get(onboardingStepDirectionAtom)).toBe('forward')

    goToPrevOnboardingStep(ctx)
    expect(ctx.get(onboardingStepDirectionAtom)).toBe('backward')
  })

  test('next and prev are no-ops without an active tour', () => {
    const ctx = createCtx()

    goToNextOnboardingStep(ctx)
    goToPrevOnboardingStep(ctx)

    expect(ctx.get(onboardingTourAtom)).toBeNull()
  })

  test('end clears the tour, the exit transition and the rects', () => {
    const ctx = createCtx()
    startOnboardingTour(ctx, 'listen', '/')
    onboardingExitStepIndexAtom(ctx, 0)
    registerOnboardingTargetRect(ctx, { id: 'a', rect: RECT })

    endOnboardingTour(ctx)

    expect(ctx.get(onboardingTourAtom)).toBeNull()
    expect(ctx.get(onboardingExitStepIndexAtom)).toBeNull()
    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })
})

describe('onboarding tour start resume', () => {
  test('starts on the screen the user is already on, skipping the lead-up', () => {
    const ctx = createCtx()

    startOnboardingTour(ctx, 'settings', '/settings')

    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 2,
      scenarioId: 'settings',
      skippedDeckIndexes: [0, 1],
    })

    const deck = buildTourDeck(scenariosById.settings.steps)
    const progress = resolveDeckProgress(deck, [0, 1], 2)
    expect(progress.displayIndex).toBe(0)
    expect(progress.displayTotal).toBe(5)
  })

  test('starts from the beginning on the first screen of the scenario', () => {
    const ctx = createCtx()

    startOnboardingTour(ctx, 'settings', '/more')

    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 0,
      scenarioId: 'settings',
      skippedDeckIndexes: [],
    })
  })

  test('starts from the beginning for a global scenario', () => {
    const ctx = createCtx()

    startOnboardingTour(ctx, 'welcome', '/settings')

    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 0,
      scenarioId: 'welcome',
      skippedDeckIndexes: [],
    })
  })
})

describe('onboarding tour model skip flow', () => {
  test('skip forward drops the current card and lands on the nearest visible one', () => {
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 4, scenarioId: PLAYLIST_MENU, skippedDeckIndexes: [] })

    skipOnboardingStep(ctx, 'next')

    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 5,
      scenarioId: PLAYLIST_MENU,
      skippedDeckIndexes: [4],
    })
  })

  test('skip forward rests on the last visible card when nothing follows', () => {
    const ctx = createCtx()
    onboardingTourAtom(ctx, {
      deckIndex: 7,
      scenarioId: PLAYLIST_MENU,
      skippedDeckIndexes: [8, 9],
    })

    skipOnboardingStep(ctx, 'next')

    // The trailing entries are already gone: the current card is the deck's last
    // visible one, so it stays put and the tour keeps running.
    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 7,
      scenarioId: PLAYLIST_MENU,
      skippedDeckIndexes: [8, 9],
    })
    const progress = resolveDeckProgress(PLAYLIST_MENU_DECK, [8, 9], 7)
    expect(progress.isLastVisible).toBe(true)
    expect(progress.displayTotal).toBe(PLAYLIST_MENU_DECK.length - 2)
  })

  test('skip backward crosses a skipped gap', () => {
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 4, scenarioId: PLAYLIST_MENU, skippedDeckIndexes: [2, 3] })

    skipOnboardingStep(ctx, 'back')

    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 1,
      scenarioId: PLAYLIST_MENU,
      skippedDeckIndexes: [2, 3, 4],
    })
  })

  test('next steps over an already-skipped entry', () => {
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 3, scenarioId: PLAYLIST_MENU, skippedDeckIndexes: [4] })

    goToNextOnboardingStep(ctx)

    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 5,
      scenarioId: PLAYLIST_MENU,
      skippedDeckIndexes: [4],
    })
  })

  test('start resets the skipped entries', () => {
    const ctx = createCtx()
    onboardingTourAtom(ctx, { deckIndex: 5, scenarioId: PLAYLIST_MENU, skippedDeckIndexes: [4, 8] })

    startOnboardingTour(ctx, 'playlist-menu', '/')

    expect(ctx.get(onboardingTourAtom)).toEqual({
      deckIndex: 0,
      scenarioId: PLAYLIST_MENU,
      skippedDeckIndexes: [],
    })
  })

  test('skip is a no-op without an active tour', () => {
    const ctx = createCtx()

    skipOnboardingStep(ctx, 'next')

    expect(ctx.get(onboardingTourAtom)).toBeNull()
  })
})
