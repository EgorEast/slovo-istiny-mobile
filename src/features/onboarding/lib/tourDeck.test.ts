import { type OnboardingStep } from './scenarios'
import {
  buildTourDeck,
  deckCardStep,
  resolveDeckProgress,
  resolveHiddenDeckIndexes,
} from './tourDeck'

const card = (title: string): OnboardingStep => ({ text: '', title })
const action = (tapActionId: string): OnboardingStep => ({ tapActionId, text: '', title: '' })
const entry = (tapTargetId: string): OnboardingStep => ({ tapTargetId, text: '', title: '' })
const navEntry = (route: string): OnboardingStep => ({ route, text: '', title: '' })

describe('buildTourDeck', () => {
  test('treats every card as an entry and attaches a following action as its exit', () => {
    const deck = buildTourDeck([card('a'), action('one'), card('b'), action('two'), card('c')])

    expect(deck).toEqual([
      { cardIndex: 0, entryStepIndexes: [], exitStepIndexes: [1] },
      { cardIndex: 2, entryStepIndexes: [], exitStepIndexes: [3] },
      { cardIndex: 4, entryStepIndexes: [], exitStepIndexes: [] },
    ])
  })

  test('attaches consecutive actions to the preceding card in order', () => {
    const deck = buildTourDeck([card('a'), action('one'), action('two'), card('b')])

    expect(deck).toEqual([
      { cardIndex: 0, entryStepIndexes: [], exitStepIndexes: [1, 2] },
      { cardIndex: 3, entryStepIndexes: [], exitStepIndexes: [] },
    ])
  })

  test('attaches trailing actions to the last card', () => {
    const deck = buildTourDeck([card('a'), action('one')])

    expect(deck).toEqual([{ cardIndex: 0, entryStepIndexes: [], exitStepIndexes: [1] }])
  })

  test('drops leading actions and warns about the authoring-rule violation', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    const deck = buildTourDeck([action('one'), card('a')])

    expect(deck).toEqual([{ cardIndex: 1, entryStepIndexes: [], exitStepIndexes: [] }])
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })

  test('yields an empty deck when there is no card at all', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    expect(buildTourDeck([action('one')])).toEqual([])
    warn.mockRestore()
  })
})

describe('buildTourDeck entry transitions', () => {
  test('attaches consecutive entry transitions to the following card in order', () => {
    const deck = buildTourDeck([card('a'), entry('one'), entry('two'), card('b')])

    expect(deck).toEqual([
      { cardIndex: 0, entryStepIndexes: [], exitStepIndexes: [] },
      { cardIndex: 3, entryStepIndexes: [1, 2], exitStepIndexes: [] },
    ])
  })

  test('keeps the scenario opening step a card even when it only taps', () => {
    // read's opening step is `tapTargetId` with no `targetId`: it stays the opening
    // card (a tour must start with a card), not a leading entry transition.
    const deck = buildTourDeck([entry('tab.read'), card('a')])

    expect(deck).toEqual([
      { cardIndex: 0, entryStepIndexes: [], exitStepIndexes: [] },
      { cardIndex: 1, entryStepIndexes: [], exitStepIndexes: [] },
    ])
  })

  test('attaches a tap-target-less route step as a pure-navigation entry', () => {
    const deck = buildTourDeck([card('a'), navEntry('/more'), card('b')])

    expect(deck).toEqual([
      { cardIndex: 0, entryStepIndexes: [], exitStepIndexes: [] },
      { cardIndex: 2, entryStepIndexes: [1], exitStepIndexes: [] },
    ])
  })

  test('routes an exit to the preceding card and an entry to the following one', () => {
    const deck = buildTourDeck([card('a'), action('one'), entry('two'), card('b')])

    expect(deck).toEqual([
      { cardIndex: 0, entryStepIndexes: [], exitStepIndexes: [1] },
      { cardIndex: 3, entryStepIndexes: [2], exitStepIndexes: [] },
    ])
  })

  test('drops trailing entry transitions and warns', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    const deck = buildTourDeck([card('a'), entry('one')])

    expect(deck).toEqual([{ cardIndex: 0, entryStepIndexes: [], exitStepIndexes: [] }])
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })
})

describe('deckCardStep', () => {
  test('returns the card step of the entry', () => {
    const steps = [card('a'), action('one'), card('b')]
    const [firstEntry] = buildTourDeck(steps)

    expect(deckCardStep(steps, firstEntry)).toBe(steps[0])
  })
})

describe('resolveDeckProgress', () => {
  const deck = buildTourDeck([
    card('a'),
    card('b'),
    action('one'),
    card('c'),
    card('d'),
    card('e'),
    card('f'),
  ])

  test('counts the whole deck when nothing is skipped', () => {
    expect(resolveDeckProgress(deck, [], 3)).toEqual({
      displayIndex: 3,
      displayTotal: 6,
      isFirstVisible: false,
      isLastVisible: false,
    })
  })

  test('removes skipped entries from the count and the position', () => {
    expect(resolveDeckProgress(deck, [1, 4], 3)).toEqual({
      displayIndex: 2,
      displayTotal: 4,
      isFirstVisible: false,
      isLastVisible: false,
    })
  })

  test('marks the first and last surviving entries', () => {
    expect(resolveDeckProgress(deck, [0, 5], 1)).toMatchObject({
      isFirstVisible: true,
      isLastVisible: false,
    })
    expect(resolveDeckProgress(deck, [0, 5], 4)).toMatchObject({
      isFirstVisible: false,
      isLastVisible: true,
    })
  })

  test('ignores skipped indexes outside the deck', () => {
    expect(resolveDeckProgress(deck, [-1, 99], 1).displayTotal).toBe(6)
  })
})

describe('resolveHiddenDeckIndexes', () => {
  test('maps hidden card step indexes to their deck positions', () => {
    const deck = buildTourDeck([card('a'), action('one'), card('b'), card('c'), card('d')])

    // Hidden card steps 0 and 3 sit at deck positions 0 and 2 (the action is not an entry).
    expect(resolveHiddenDeckIndexes(deck, [0, 3])).toEqual([0, 2])
  })
})
