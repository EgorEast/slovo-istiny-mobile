import { getTourAction, registerTourAction, unregisterTourAction } from './tourActions'

const ACTION_ID = 'demo-action'

describe('tour action registry', () => {
  afterEach(() => {
    unregisterTourAction(ACTION_ID)
  })

  test('registers and returns an action by id', () => {
    const action = jest.fn()

    registerTourAction(ACTION_ID, action)

    expect(getTourAction(ACTION_ID)).toBe(action)
  })

  test('returns undefined for an unregistered id', () => {
    expect(getTourAction(ACTION_ID)).toBeUndefined()
  })

  test('unregisters an action', () => {
    registerTourAction(ACTION_ID, jest.fn())

    unregisterTourAction(ACTION_ID)

    expect(getTourAction(ACTION_ID)).toBeUndefined()
  })
})
