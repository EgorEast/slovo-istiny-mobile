import { fireEvent, screen } from '@testing-library/react-native'
import { renderWithProviders } from 'shared/mocks'
import { type OnboardingStep } from '../lib/scenarios'
import { TourWaitLayer } from './TourWaitLayer'

jest.mock('./TourDim', () => {
  const { View } = jest.requireActual('react-native')

  return { TourDim: (props: object) => <View {...props} /> }
})

const NEXT_LABEL = 'Далее'
const AREA_HIGHLIGHT = 'onboarding-area-highlight'
const AREA = { height: 60, width: 300, x: 0, y: 100 }
const AREA_STEP: OnboardingStep = { areaTargetIds: ['zone'], text: 'Text', title: 'Area' }

type PointerEvents = 'auto' | 'box-none' | 'none'
type QueryNode = ReturnType<typeof screen.getByText>

const findPointerAncestor = (node: QueryNode, pointerEvents: PointerEvents) => {
  let current = node.parent

  while (current !== null) {
    if (current.props.pointerEvents === pointerEvents) return current
    current = current.parent
  }

  return null
}

const renderLayer = async (onNext = jest.fn()) => {
  const utils = await renderWithProviders(
    <TourWaitLayer
      hole={null}
      isFirstVisible
      onNext={onNext}
      bottomInset={0}
      isWaitSatisfied
      displayIndex={0}
      displayTotal={3}
      step={AREA_STEP}
      windowWidth={400}
      onPrev={jest.fn()}
      windowHeight={800}
      onClose={jest.fn()}
      isLastVisible={false}
      areaRects={[{ id: 'zone', rect: AREA }]}
    />,
  )

  return { ...utils, onNext }
}

describe('<TourWaitLayer>', () => {
  test('keeps the card pressable through a box-none wrapper while effects pass through', async () => {
    const { onNext } = await renderLayer()
    const next = screen.getByText(NEXT_LABEL)

    // The card box is an `auto` target inside a `box-none` wrapper: empty wrapper
    // area falls through to the app, the card stays touchable.
    expect(findPointerAncestor(next, 'auto')).not.toBeNull()
    expect(findPointerAncestor(next, 'box-none')).not.toBeNull()
    // The effects layer is `none`, so it never intercepts a touch.
    expect(findPointerAncestor(screen.getByTestId(AREA_HIGHLIGHT), 'none')).not.toBeNull()

    fireEvent.press(next)

    expect(onNext).toHaveBeenCalledTimes(1)
  })

  test('renders the translucent fill of every area rect', async () => {
    await renderLayer()

    expect(screen.getAllByTestId(AREA_HIGHLIGHT)).toHaveLength(1)
  })
})
