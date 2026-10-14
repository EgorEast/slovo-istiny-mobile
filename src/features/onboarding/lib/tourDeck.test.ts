import { type OnboardingStep } from './scenarios'
import {
  buildTourDeck,
  deckCardStep,
  resolveDeckProgress,
  resolveHiddenDeckIndexes,
} from './tourDeck'

const card = (title: string): OnboardingStep => ({ text: '', title })
const action = (tapActionId: string): OnboardingStep => ({ tapActionId, text: '', title: '' })

describe('buildTourDeck', () => {
  test('treats every card as an entry and attaches a following action as its exit', () => {
    const deck = buildTourDeck([card('a'), action('one'), card('b'), action('two'), card('c')])

    expect(deck).toEqual([
      { cardIndex: 0, exitStepIndexes: [1] },
      { cardIndex: 2, exitStepIndexes: [3] },
      { cardIndex: 4, exitStepIndexes: [] },
    ])
  })

  test('attaches consecutive actions to the preceding card in order', () => {
    const deck = buildTourDeck([card('a'), action('one'), action('two'), card('b')])

    expect(deck).toEqual([
      { cardIndex: 0, exitStepIndexes: [1, 2] },
      { cardIndex: 3, exitStepIndexes: [] },
    ])
  })

  test('attaches trailing actions to the last card', () => {
    const deck = buildTourDeck([card('a'), action('one')])

    expect(deck).toEqual([{ cardIndex: 0, exitStepIndexes: [1] }])
  })

  test('drops leading actions and warns about the authoring-rule violation', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    const deck = buildTourDeck([action('one'), card('a')])

    expect(deck).toEqual([{ cardIndex: 1, exitStepIndexes: [] }])
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })

  test('yields an empty deck when there is no card at all', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    expect(buildTourDeck([action('one')])).toEqual([])
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
