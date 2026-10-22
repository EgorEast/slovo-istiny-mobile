import { fireEvent, render, screen } from '@testing-library/react-native'
import { impactAsync } from 'expo-haptics'
import { Text } from 'react-native'
import { TouchableButton } from './TouchableButton'

const mockedImpactAsync = impactAsync as jest.MockedFunction<typeof impactAsync>

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
})
