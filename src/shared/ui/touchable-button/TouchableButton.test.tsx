import { fireEvent, render, screen } from '@testing-library/react-native'
import { impactAsync } from 'expo-haptics'
import { Text } from 'react-native'
import * as hapticsModule from '../../lib/haptics'
import { PRESS_HAPTIC_DELAY_MS } from '../../lib/usePressHaptic'
import { TouchableButton } from './TouchableButton'

const mockedImpactAsync = impactAsync as jest.MockedFunction<typeof impactAsync>

// Long enough for RN Pressability to arm and fire its default ~500ms long-press
// timer inside the simulated gesture.
const LONG_PRESS_GESTURE_MS = 520

// hapticLight merges pulses within a 200ms window and the suite runs faster
// than that — wait it out so each long-press starts from a clean slate.
const waitOutHapticThrottle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 210))

// Early-haptic tests advance the press delay instead of sleeping it out. The
// clock starts far ahead of wall time (the real-timer tests above leave a recent
// throttle stamp) and steps forward per test, so the module-level 200ms throttle
// never interferes.
const FIRST_FAKE_NOW_MS = 4_000_000_000_000
let fakeNowMs = FIRST_FAKE_NOW_MS

const startFakeHapticsClock = () => {
  jest.useFakeTimers()
  fakeNowMs += 1000
  jest.setSystemTime(fakeNowMs)
}

describe('<TouchableButton>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('defaults to the button role', async () => {
    await render(
      <TouchableButton onPress={jest.fn()}>
        <Text>tap</Text>
      </TouchableButton>,
    )

    expect(screen.getByRole('button', { name: 'tap' })).toBeTruthy()
  })

  test('accepts an explicit role override', async () => {
    await render(
      <TouchableButton onPress={jest.fn()} accessibilityRole='link'>
        <Text>tap</Text>
      </TouchableButton>,
    )

    expect(screen.getByRole('link', { name: 'tap' })).toBeTruthy()
  })

  test('disabled button does not trigger haptics on press', async () => {
    await render(
      <TouchableButton disabled onPress={jest.fn()}>
        <Text>tap</Text>
      </TouchableButton>,
    )

    await fireEvent(screen.getByRole('button', { name: 'tap' }), 'press')

    expect(mockedImpactAsync).not.toHaveBeenCalled()
  })

  test('hapticDisabled button does not trigger haptics on press', async () => {
    await render(
      <TouchableButton hapticDisabled onPress={jest.fn()}>
        <Text>tap</Text>
      </TouchableButton>,
    )

    await fireEvent(screen.getByRole('button', { name: 'tap' }), 'press')

    expect(mockedImpactAsync).not.toHaveBeenCalled()
  })

  test('completed press triggers tap haptics', async () => {
    await render(
      <TouchableButton onPress={jest.fn()}>
        <Text>tap</Text>
      </TouchableButton>,
    )

    await fireEvent(screen.getByRole('button', { name: 'tap' }), 'press')

    expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
  })

  test('press-in alone does not trigger haptics immediately', async () => {
    await render(
      <TouchableButton onPress={jest.fn()}>
        <Text>tap</Text>
      </TouchableButton>,
    )

    await fireEvent(screen.getByRole('button', { name: 'tap' }), 'pressIn')

    expect(mockedImpactAsync).not.toHaveBeenCalled()
  })

  test('hapticDisabled button still fires onPressIn', async () => {
    const onPressIn = jest.fn()
    await render(
      <TouchableButton hapticDisabled onPress={jest.fn()} onPressIn={onPressIn}>
        <Text>tap</Text>
      </TouchableButton>,
    )

    await fireEvent(screen.getByRole('button', { name: 'tap' }), 'pressIn')

    expect(onPressIn).toHaveBeenCalledTimes(1)
  })

  test('completed long-press triggers haptics', async () => {
    await render(
      <TouchableButton onLongPress={jest.fn()}>
        <Text>tap</Text>
      </TouchableButton>,
    )

    await waitOutHapticThrottle()
    await fireEvent(screen.getByRole('button', { name: 'tap' }), 'longPress')

    expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
  })

  test('disabled button does not trigger haptics on long-press', async () => {
    await render(
      <TouchableButton disabled onLongPress={jest.fn()}>
        <Text>tap</Text>
      </TouchableButton>,
    )

    await waitOutHapticThrottle()
    await fireEvent(screen.getByRole('button', { name: 'tap' }), 'longPress')

    expect(mockedImpactAsync).not.toHaveBeenCalled()
  })

  test('hapticDisabled button does not trigger haptics on long-press', async () => {
    await render(
      <TouchableButton hapticDisabled onLongPress={jest.fn()}>
        <Text>tap</Text>
      </TouchableButton>,
    )

    await waitOutHapticThrottle()
    await fireEvent(screen.getByRole('button', { name: 'tap' }), 'longPress')

    expect(mockedImpactAsync).not.toHaveBeenCalled()
  })

  test('slow press without a long-press action vibrates exactly once', async () => {
    const onPress = jest.fn()
    await waitOutHapticThrottle()
    await render(
      <TouchableButton onPress={onPress}>
        <Text>tap</Text>
      </TouchableButton>,
    )
    const button = screen.getByRole('button', { name: 'tap' })

    // fireEvent('pressIn') calls the prop directly and skips Pressability, while
    // the phantom second vibration comes from Pressability's long-press timer.
    // Entering through the responder path replays the gesture the device runs.
    const nativeEvent = {
      changedTouches: [],
      pageX: 0,
      pageY: 0,
      timestamp: Date.now(),
      touches: [],
    }
    await fireEvent(button, 'responderGrant', {
      currentTarget: { measure: jest.fn() },
      dispatchConfig: { registrationName: 'onResponderGrant' },
      nativeEvent,
      persist: jest.fn(),
    })

    await new Promise(resolve => setTimeout(resolve, LONG_PRESS_GESTURE_MS))

    await fireEvent(button, 'responderRelease', {
      currentTarget: { measure: jest.fn() },
      nativeEvent,
      persist: jest.fn(),
    })

    expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  test('a press landing before the early deadline still vibrates exactly once', async () => {
    await waitOutHapticThrottle()
    await render(
      <TouchableButton onPress={jest.fn()}>
        <Text>tap</Text>
      </TouchableButton>,
    )
    const button = screen.getByRole('button', { name: 'tap' })
    // Counted at the haptic layer: the 200ms throttle would otherwise mask the
    // second pulse of the race this test reproduces.
    const hapticSpy = jest.spyOn(hapticsModule, 'hapticLight')

    try {
      // Device-proven Android release order: onPress is delivered BEFORE
      // onPressOut, so the early deadline (pressIn+120ms) can land after the
      // press haptic (pressIn+71ms) and pulse a second time 49ms later.
      await fireEvent(button, 'pressIn')
      await new Promise(resolve => setTimeout(resolve, 70))
      await fireEvent(button, 'press')
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(hapticSpy).toHaveBeenCalledTimes(1)
    } finally {
      hapticSpy.mockRestore()
    }
  })

  describe('early press haptic', () => {
    beforeEach(() => {
      startFakeHapticsClock()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test('fires once while the finger is still down and not again on release', async () => {
      await render(
        <TouchableButton onPress={jest.fn()}>
          <Text>tap</Text>
        </TouchableButton>,
      )
      const button = screen.getByRole('button', { name: 'tap' })

      await fireEvent(button, 'pressIn')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)

      await fireEvent(button, 'press')

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
    })

    test('fires at release when a fast tap cancels the timer first', async () => {
      await render(
        <TouchableButton onPress={jest.fn()}>
          <Text>tap</Text>
        </TouchableButton>,
      )
      const button = screen.getByRole('button', { name: 'tap' })

      await fireEvent(button, 'pressIn')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS - 60)
      await fireEvent(button, 'pressOut')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).not.toHaveBeenCalled()

      await fireEvent(button, 'press')

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
    })

    test('stays silent when a scroll claim cancels the press', async () => {
      await render(
        <TouchableButton>
          <Text>tap</Text>
        </TouchableButton>,
      )
      const button = screen.getByRole('button', { name: 'tap' })

      await fireEvent(button, 'pressIn')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS - 60)
      await fireEvent(button, 'pressOut')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).not.toHaveBeenCalled()
    })

    test('long-press element skips the early timer and vibrates at the menu', async () => {
      await render(
        <TouchableButton onPress={jest.fn()} onLongPress={jest.fn()}>
          <Text>tap</Text>
        </TouchableButton>,
      )
      const button = screen.getByRole('button', { name: 'tap' })

      await fireEvent(button, 'pressIn')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS * 2)

      expect(mockedImpactAsync).not.toHaveBeenCalled()

      await fireEvent(button, 'longPress')

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
    })

    test('hapticDisabled button never starts the timer', async () => {
      await render(
        <TouchableButton hapticDisabled onPress={jest.fn()}>
          <Text>tap</Text>
        </TouchableButton>,
      )
      const button = screen.getByRole('button', { name: 'tap' })

      await fireEvent(button, 'pressIn')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).not.toHaveBeenCalled()
    })

    test('disabled button never starts the timer', async () => {
      await render(
        <TouchableButton disabled onPress={jest.fn()}>
          <Text>tap</Text>
        </TouchableButton>,
      )
      const button = screen.getByRole('button', { name: 'tap' })

      await fireEvent(button, 'pressIn')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).not.toHaveBeenCalled()
    })
  })
})
