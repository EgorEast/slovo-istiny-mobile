import { createCtx } from '@reatom/framework'
import { scenariosById } from './lib/scenarios'
import { resolveTourProgress } from './lib/tourProgress'
import {
  endOnboardingTour,
  goToNextOnboardingStep,
  goToPrevOnboardingStep,
  onboardingTargetRectsAtom,
  onboardingTourAtom,
  registerOnboardingTargetRect,
  skipOnboardingStep,
  startOnboardingTour,
} from './model'

const RECT = { height: 4, width: 3, x: 1, y: 2 }
const PLAYLIST_MENU = 'playlist-menu'
const PLAYLIST_STEPS = scenariosById[PLAYLIST_MENU].steps

describe('onboarding model', () => {
  test('start sets the first step and wipes previous target rects', () => {
    const ctx = createCtx()
    onboardingTargetRectsAtom(ctx, { target: RECT })

    startOnboardingTour(ctx, 'listen')

    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: 'listen',
      skippedIndexes: [],
      stepIndex: 0,
    })
    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })

  test('register adds and overwrites a target rect', () => {
    const ctx = createCtx()

    registerOnboardingTargetRect(ctx, { id: 'a', rect: RECT })
    registerOnboardingTargetRect(ctx, { id: 'b', rect: { height: 8, width: 7, x: 5, y: 6 } })
    registerOnboardingTargetRect(ctx, { id: 'a', rect: { height: 4, width: 3, x: 9, y: 9 } })

    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({
      a: { height: 4, width: 3, x: 9, y: 9 },
      b: { height: 8, width: 7, x: 5, y: 6 },
    })
  })

  test('next advances and clamps at the last step', () => {
    const ctx = createCtx()
    startOnboardingTour(ctx, 'study')

    goToNextOnboardingStep(ctx)
    goToNextOnboardingStep(ctx)
    goToNextOnboardingStep(ctx)

    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: 'study',
      skippedIndexes: [],
      stepIndex: 1,
    })
  })

  test('prev goes back and clamps at the first step', () => {
    const ctx = createCtx()
    startOnboardingTour(ctx, 'listen')
    goToNextOnboardingStep(ctx)

    goToPrevOnboardingStep(ctx)
    goToPrevOnboardingStep(ctx)

    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: 'listen',
      skippedIndexes: [],
      stepIndex: 0,
    })
  })

  test('next and prev are no-ops without an active tour', () => {
    const ctx = createCtx()

    goToNextOnboardingStep(ctx)
    goToPrevOnboardingStep(ctx)

    expect(ctx.get(onboardingTourAtom)).toBeNull()
  })

  test('end clears the tour and the rects', () => {
    const ctx = createCtx()
    startOnboardingTour(ctx, 'listen')
    registerOnboardingTargetRect(ctx, { id: 'a', rect: RECT })

    endOnboardingTour(ctx)

    expect(ctx.get(onboardingTourAtom)).toBeNull()
    expect(ctx.get(onboardingTargetRectsAtom)).toEqual({})
  })
})

describe('onboarding model skip flow', () => {
  test('skip forward drops the current step and lands on the nearest visible one', () => {
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: PLAYLIST_MENU, skippedIndexes: [], stepIndex: 4 })

    skipOnboardingStep(ctx, 'next')

    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: PLAYLIST_MENU,
      skippedIndexes: [4],
      stepIndex: 5,
    })
  })

  test('skip forward rests on the last visible step when nothing follows', () => {
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: PLAYLIST_MENU, skippedIndexes: [8, 9], stepIndex: 7 })

    skipOnboardingStep(ctx, 'next')

    // The trailing steps are already gone: the current step is the deck's last
    // visible one, so it stays put and the tour keeps running.
    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: PLAYLIST_MENU,
      skippedIndexes: [8, 9],
      stepIndex: 7,
    })
    const progress = resolveTourProgress(PLAYLIST_STEPS, [8, 9], 7)
    expect(progress.isLastVisible).toBe(true)
    expect(progress.displayTotal).toBe(PLAYLIST_STEPS.length - 2)
  })

  test('skip backward crosses a skipped gap', () => {
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: PLAYLIST_MENU, skippedIndexes: [2, 3], stepIndex: 4 })

    skipOnboardingStep(ctx, 'back')

    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: PLAYLIST_MENU,
      skippedIndexes: [2, 3, 4],
      stepIndex: 1,
    })
  })

  test('next steps over an already-skipped index', () => {
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: PLAYLIST_MENU, skippedIndexes: [4], stepIndex: 3 })

    goToNextOnboardingStep(ctx)

    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: PLAYLIST_MENU,
      skippedIndexes: [4],
      stepIndex: 5,
    })
  })

  test('start resets the skipped steps', () => {
    const ctx = createCtx()
    onboardingTourAtom(ctx, { scenarioId: PLAYLIST_MENU, skippedIndexes: [4, 8], stepIndex: 5 })

    startOnboardingTour(ctx, 'playlist-menu')

    expect(ctx.get(onboardingTourAtom)).toEqual({
      scenarioId: PLAYLIST_MENU,
      skippedIndexes: [],
      stepIndex: 0,
    })
  })

  test('skip is a no-op without an active tour', () => {
    const ctx = createCtx()

    skipOnboardingStep(ctx, 'next')

    expect(ctx.get(onboardingTourAtom)).toBeNull()
  })
})
