import { type OnboardingTargetRect } from '../model/targets'
import { isTargetRectOnScreen, pickOnboardingTargetRect, resolveTourHole } from './tourHole'

const WINDOW_HEIGHT = 800
const ON_SCREEN: OnboardingTargetRect = { height: 40, width: 40, x: 10, y: 100 }
const OFF_SCREEN_BELOW: OnboardingTargetRect = { height: 60, width: 300, x: 0, y: 99999 }
const OFF_SCREEN_ABOVE: OnboardingTargetRect = { height: 40, width: 40, x: 0, y: -100 }

describe('isTargetRectOnScreen', () => {
  test('is on screen while part of the rect sits inside the viewport', () => {
    expect(isTargetRectOnScreen(ON_SCREEN, WINDOW_HEIGHT)).toBe(true)
  })

  test('is off screen when fully below the viewport', () => {
    expect(isTargetRectOnScreen(OFF_SCREEN_BELOW, WINDOW_HEIGHT)).toBe(false)
  })

  test('is off screen when fully above the viewport', () => {
    expect(isTargetRectOnScreen(OFF_SCREEN_ABOVE, WINDOW_HEIGHT)).toBe(false)
  })
})

describe('pickOnboardingTargetRect', () => {
  test('prefers the on-screen instance over an off-screen one', () => {
    const picked = pickOnboardingTargetRect(
      { hidden: OFF_SCREEN_BELOW, visible: ON_SCREEN },
      WINDOW_HEIGHT,
    )

    expect(picked).toEqual(ON_SCREEN)
  })

  test('keeps the on-screen instance once the off-screen one is released', () => {
    const picked = pickOnboardingTargetRect({ visible: ON_SCREEN }, WINDOW_HEIGHT)

    expect(picked).toEqual(ON_SCREEN)
  })

  test('falls back to the first rect when every instance is off screen', () => {
    const picked = pickOnboardingTargetRect(
      { first: OFF_SCREEN_BELOW, second: { ...OFF_SCREEN_BELOW, y: 88888 } },
      WINDOW_HEIGHT,
    )

    expect(picked).toEqual(OFF_SCREEN_BELOW)
  })

  test('returns undefined for an empty registry', () => {
    expect(pickOnboardingTargetRect({}, WINDOW_HEIGHT)).toBeUndefined()
  })
})

describe('resolveTourHole', () => {
  const input = {
    activeTargetId: 'target',
    expiredStepKey: null,
    height: WINDOW_HEIGHT,
    stepKey: 'scenario:0',
  }

  test('cuts a hole around the on-screen instance of the shared target', () => {
    const result = resolveTourHole({
      ...input,
      rects: { target: { hidden: OFF_SCREEN_BELOW, visible: ON_SCREEN } },
    })

    expect(result.holes).toEqual([ON_SCREEN])
    expect(result.isWaitingForTarget).toBe(false)
  })

  test('degrades to no hole with the card shown when every instance is off screen', () => {
    const result = resolveTourHole({
      ...input,
      rects: { target: { first: OFF_SCREEN_BELOW } },
    })

    expect(result.holes).toEqual([])
    expect(result.isWaitingForTarget).toBe(false)
  })

  test('waits for a target whose id is not registered at all', () => {
    const result = resolveTourHole({ ...input, rects: {} })

    expect(result.holes).toEqual([])
    expect(result.isWaitingForTarget).toBe(true)
  })
})
