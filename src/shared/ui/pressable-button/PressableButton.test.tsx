import { fireEvent, render, screen } from '@testing-library/react-native'
import { impactAsync } from 'expo-haptics'
import { PRESS_HAPTIC_CANCEL_DRIFT_PX, PRESS_HAPTIC_DELAY_MS } from '../../lib/usePressHaptic'
import { PressableButton } from './PressableButton'

const BUTTON_LABEL = 'test-button'
const LINK_LABEL = 'test-link'

// Long enough for RN Pressability to arm and fire its default ~500ms long-press
// timer inside the simulated gesture.
const LONG_PRESS_GESTURE_MS = 520

const mockedImpactAsync = impactAsync as jest.MockedFunction<typeof impactAsync>

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

describe('<PressableButton>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders with button role by default', async () => {
    await render(<PressableButton accessibilityLabel={BUTTON_LABEL} />)

    expect(screen.getByRole('button', { name: BUTTON_LABEL })).toBeTruthy()
  })

  test('explicit accessibilityRole overrides the default', async () => {
    await render(<PressableButton accessibilityRole='link' accessibilityLabel={LINK_LABEL} />)

    expect(screen.getByRole('link', { name: LINK_LABEL })).toBeTruthy()
    expect(screen.queryByRole('button', { name: LINK_LABEL })).toBeNull()
  })

  test('disabled button does not trigger haptics on press', async () => {
    await render(<PressableButton disabled accessibilityLabel={BUTTON_LABEL} />)

    await fireEvent(screen.getByRole('button', { name: BUTTON_LABEL }), 'press')

    expect(mockedImpactAsync).not.toHaveBeenCalled()
  })

  test('completed press triggers tap haptics', async () => {
    await render(<PressableButton onPress={jest.fn()} accessibilityLabel={BUTTON_LABEL} />)

    await fireEvent(screen.getByRole('button', { name: BUTTON_LABEL }), 'press')

    expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
  })

  test('press-in alone does not trigger haptics immediately', async () => {
    await render(<PressableButton accessibilityLabel={BUTTON_LABEL} />)

    await fireEvent(screen.getByRole('button', { name: BUTTON_LABEL }), 'pressIn')

    expect(mockedImpactAsync).not.toHaveBeenCalled()
  })

  test('completed long-press triggers haptics', async () => {
    await render(<PressableButton onLongPress={jest.fn()} accessibilityLabel={BUTTON_LABEL} />)

    await waitOutHapticThrottle()
    await fireEvent(screen.getByRole('button', { name: BUTTON_LABEL }), 'longPress')

    expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
  })

  test('disabled button does not trigger haptics on long-press', async () => {
    await render(<PressableButton disabled accessibilityLabel={BUTTON_LABEL} />)

    await waitOutHapticThrottle()
    await fireEvent(screen.getByRole('button', { name: BUTTON_LABEL }), 'longPress')

    expect(mockedImpactAsync).not.toHaveBeenCalled()
  })

  test('slow press without a long-press action vibrates exactly once', async () => {
    const onPress = jest.fn()
    await waitOutHapticThrottle()
    await render(<PressableButton onPress={onPress} accessibilityLabel={BUTTON_LABEL} />)
    const button = screen.getByRole('button', { name: BUTTON_LABEL })

    // fireEvent('pressIn') calls the prop directly and skips Pressability, while
    // the phantom second vibration comes from Pressability's long-press timer.
    // Entering through the responder path replays the gesture the device runs.
    await fireEvent(button, 'responderGrant', {
      currentTarget: { measure: jest.fn() },
      nativeEvent: { changedTouches: [], pageX: 0, pageY: 0, timestamp: Date.now(), touches: [] },
      persist: jest.fn(),
    })

    await new Promise(resolve => setTimeout(resolve, LONG_PRESS_GESTURE_MS))

    await fireEvent(button, 'pressOut')
    await fireEvent(button, 'press')

    expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  describe('early press haptic', () => {
    beforeEach(() => {
      startFakeHapticsClock()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test('fires once while the finger is still down and not again on release', async () => {
      await render(<PressableButton onPress={jest.fn()} accessibilityLabel={BUTTON_LABEL} />)
      const button = screen.getByRole('button', { name: BUTTON_LABEL })

      await fireEvent(button, 'pressIn')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)

      await fireEvent(button, 'press')

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
    })

    test('a re-granted responder mid-gesture still vibrates only once', async () => {
      const { rerender } = await render(
        <PressableButton key='first' onPress={jest.fn()} accessibilityLabel={BUTTON_LABEL} />,
      )

      await fireEvent(screen.getByRole('button', { name: BUTTON_LABEL }), 'pressIn')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)

      await fireEvent(screen.getByRole('button', { name: BUTTON_LABEL }), 'pressOut')
      // The finger stays down a moment longer before the release lands.
      jest.advanceTimersByTime(150)

      // A mid-gesture remount (or a re-granted responder) starts with a clean
      // per-instance dedup flag, so only the vibration-layer window can merge the
      // release pulse into the tap that already pulsed.
      await rerender(
        <PressableButton key='second' onPress={jest.fn()} accessibilityLabel={BUTTON_LABEL} />,
      )
      await fireEvent(screen.getByRole('button', { name: BUTTON_LABEL }), 'press')

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
    })

    test('fires at release when a fast tap cancels the timer first', async () => {
      await render(<PressableButton onPress={jest.fn()} accessibilityLabel={BUTTON_LABEL} />)
      const button = screen.getByRole('button', { name: BUTTON_LABEL })

      await fireEvent(button, 'pressIn')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS - 60)
      await fireEvent(button, 'pressOut')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).not.toHaveBeenCalled()

      await fireEvent(button, 'press')

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
    })

    test('stays silent when a scroll claim cancels the press', async () => {
      await render(<PressableButton accessibilityLabel={BUTTON_LABEL} />)
      const button = screen.getByRole('button', { name: BUTTON_LABEL })

      await fireEvent(button, 'pressIn')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS - 60)
      await fireEvent(button, 'pressOut')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).not.toHaveBeenCalled()
    })

    test('touch drift cancels the early timer and release pulses once', async () => {
      await render(<PressableButton onPress={jest.fn()} accessibilityLabel={BUTTON_LABEL} />)
      const button = screen.getByRole('button', { name: BUTTON_LABEL })

      await fireEvent(button, 'pressIn', { nativeEvent: { pageX: 100, pageY: 100 } })
      await fireEvent(button, 'touchMove', {
        nativeEvent: { pageX: 100 + PRESS_HAPTIC_CANCEL_DRIFT_PX + 4, pageY: 100 },
      })
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).not.toHaveBeenCalled()

      await fireEvent(button, 'press')

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
    })

    test('small wiggle under the drift threshold keeps the early pulse', async () => {
      await render(<PressableButton accessibilityLabel={BUTTON_LABEL} />)
      const button = screen.getByRole('button', { name: BUTTON_LABEL })

      await fireEvent(button, 'pressIn', { nativeEvent: { pageX: 100, pageY: 100 } })
      await fireEvent(button, 'touchMove', {
        nativeEvent: { pageX: 100 + PRESS_HAPTIC_CANCEL_DRIFT_PX - 3, pageY: 100 },
      })
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
    })

    test('movement after the early pulse does not add a second haptic', async () => {
      await render(<PressableButton onPress={jest.fn()} accessibilityLabel={BUTTON_LABEL} />)
      const button = screen.getByRole('button', { name: BUTTON_LABEL })

      await fireEvent(button, 'pressIn', { nativeEvent: { pageX: 100, pageY: 100 } })
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)
      await fireEvent(button, 'touchMove', { nativeEvent: { pageX: 120, pageY: 100 } })
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)
      await fireEvent(button, 'press')

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
    })

    test('web-wrapped touch points cancel the early timer too', async () => {
      await render(<PressableButton accessibilityLabel={BUTTON_LABEL} />)
      const button = screen.getByRole('button', { name: BUTTON_LABEL })

      await fireEvent(button, 'pressIn', {
        nativeEvent: { touches: [{ pageX: 100, pageY: 100 }] },
      })
      await fireEvent(button, 'touchMove', {
        nativeEvent: { touches: [{ pageX: 120, pageY: 100 }] },
      })
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).not.toHaveBeenCalled()
    })

    test('long-press element skips the early timer and vibrates at the menu', async () => {
      await render(
        <PressableButton
          onPress={jest.fn()}
          onLongPress={jest.fn()}
          accessibilityLabel={BUTTON_LABEL}
        />,
      )
      const button = screen.getByRole('button', { name: BUTTON_LABEL })

      await fireEvent(button, 'pressIn')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS * 2)

      expect(mockedImpactAsync).not.toHaveBeenCalled()

      await fireEvent(button, 'longPress')

      expect(mockedImpactAsync).toHaveBeenCalledTimes(1)
    })

    test('disabled button never starts the timer', async () => {
      await render(<PressableButton disabled accessibilityLabel={BUTTON_LABEL} />)
      const button = screen.getByRole('button', { name: BUTTON_LABEL })

      await fireEvent(button, 'pressIn')
      jest.advanceTimersByTime(PRESS_HAPTIC_DELAY_MS)

      expect(mockedImpactAsync).not.toHaveBeenCalled()
    })
  })
})
