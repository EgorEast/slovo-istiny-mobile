import * as Reanimated from 'react-native-reanimated'
import { renderWithProviders } from 'shared/mocks'
import { type OnboardingTargetRect } from '../model/targets'
import { TapIndicator } from './TapIndicator'

const RECT: OnboardingTargetRect = { height: 40, width: 40, x: 100, y: 200 }

describe('<TapIndicator>', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('blinks three pulses and renders the circle', async () => {
    const withRepeatSpy = jest.spyOn(Reanimated, 'withRepeat')

    const { toJSON } = await renderWithProviders(<TapIndicator rect={RECT} />)

    expect(withRepeatSpy).toHaveBeenCalledTimes(1)
    // withRepeat(animation, numberOfReps, reverse) — three blinks.
    expect(withRepeatSpy.mock.calls[0][1]).toBe(3)
    expect(toJSON()).toBeTruthy()
  })
})
