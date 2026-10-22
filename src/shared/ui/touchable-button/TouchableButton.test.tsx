import { fireEvent, render, screen } from '@testing-library/react-native'
import { impactAsync } from 'expo-haptics'
import { Text } from 'react-native'
import { TouchableButton } from './TouchableButton'

const mockedImpactAsync = impactAsync as jest.MockedFunction<typeof impactAsync>

// hapticLight throttles calls within a 45ms window and the suite runs faster
// than that — wait it out so each long-press starts from a clean slate.
const waitOutHapticThrottle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 50))

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

  test('press-in does not trigger haptics', async () => {
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
})
