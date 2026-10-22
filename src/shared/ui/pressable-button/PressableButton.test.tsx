import { fireEvent, render, screen } from '@testing-library/react-native'
import { impactAsync } from 'expo-haptics'
import { PressableButton } from './PressableButton'

const BUTTON_LABEL = 'test-button'
const LINK_LABEL = 'test-link'

const mockedImpactAsync = impactAsync as jest.MockedFunction<typeof impactAsync>

// hapticLight throttles calls within a 45ms window and the suite runs faster
// than that — wait it out so each long-press starts from a clean slate.
const waitOutHapticThrottle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 50))

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

  test('press-in does not trigger haptics', async () => {
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
})
