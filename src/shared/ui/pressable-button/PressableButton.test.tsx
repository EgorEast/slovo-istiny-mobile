import { fireEvent, render, screen } from '@testing-library/react-native'
import { impactAsync } from 'expo-haptics'
import { PRESS_HAPTIC_DELAY_MS } from '../../lib/usePressHaptic'
import { PressableButton } from './PressableButton'

const BUTTON_LABEL = 'test-button'
const LINK_LABEL = 'test-link'

const mockedImpactAsync = impactAsync as jest.MockedFunction<typeof impactAsync>

// hapticLight throttles calls within a 45ms window and the suite runs faster
// than that — wait it out so each long-press starts from a clean slate.
const waitOutHapticThrottle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 50))

// Early-haptic tests advance the press delay instead of sleeping it out. The
// clock starts far ahead of wall time (the real-timer tests above leave a recent
// throttle stamp) and steps forward per test, so the module-level 45ms throttle
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
