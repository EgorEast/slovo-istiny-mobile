import { act, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { renderWithProviders } from 'shared/mocks'
import { type OnboardingStep } from '../lib/scenarios'
import { TourSpotlight } from './TourSpotlight'

// Pin the desktop cap to a numeric value (Platform.OS is read once at module load).
const DESKTOP_COLUMN_WIDTH = 600
jest.mock('shared/ui/layout', () => ({ APP_MAX_CONTENT_WIDTH: DESKTOP_COLUMN_WIDTH }))

const mockTooltipMounts = jest.fn()

jest.mock('./TourTooltip', () => {
  const { useEffect } = jest.requireActual('react')
  const { Text } = jest.requireActual('react-native')

  return {
    TourTooltip: () => {
      useEffect(() => {
        mockTooltipMounts()
      }, [])

      return <Text>tour-tooltip</Text>
    },
  }
})

jest.mock('react-native-svg', () => {
  const { View } = jest.requireActual('react-native')

  return {
    __esModule: true,
    default: (props: object) => <View {...props} />,
    Mask: (props: object) => <View {...props} />,
    Rect: (props: object) => <View {...props} />,
  }
})

const STEP: OnboardingStep = { text: 'text', title: 'title' }
const ON_TOP_STEP: OnboardingStep = { ...STEP, presentOnTop: true }

const spotlightElement = (step: OnboardingStep, stepKey: string) => (
  <TourSpotlight
    holes={[]}
    step={step}
    width={400}
    height={800}
    isLastVisible
    isFirstVisible
    isWaitSatisfied
    displayIndex={0}
    displayTotal={1}
    anchorRect={null}
    stepKey={stepKey}
    onNext={jest.fn()}
    onPrev={jest.fn()}
    onClose={jest.fn()}
    highlightAreas={false}
    isWaitingForTarget={false}
  />
)

describe('<TourSpotlight>', () => {
  beforeEach(() => {
    mockTooltipMounts.mockClear()
  })

  test('remounts the modal per step key when presentOnTop', async () => {
    const { rerender } = await renderWithProviders(spotlightElement(ON_TOP_STEP, 'a'))

    expect(mockTooltipMounts).toHaveBeenCalledTimes(1)

    // A new step key remounts the Modal, presenting a fresh native window above any
    // app modal shown earlier.
    await act(async () => {
      rerender(spotlightElement(ON_TOP_STEP, 'b'))
    })

    expect(mockTooltipMounts).toHaveBeenCalledTimes(2)
  })

  test('keeps one mounted modal across steps without presentOnTop', async () => {
    const { rerender } = await renderWithProviders(spotlightElement(STEP, 'a'))

    expect(mockTooltipMounts).toHaveBeenCalledTimes(1)

    await act(async () => {
      rerender(spotlightElement(STEP, 'b'))
    })

    // The single Modal persists across steps — no per-step remount flicker.
    expect(mockTooltipMounts).toHaveBeenCalledTimes(1)
  })

  test('caps the tooltip to the shared desktop column and centers it', async () => {
    await renderWithProviders(spotlightElement(STEP, 'a'))

    const tooltip = screen.getByText('tour-tooltip').parent
    const style = StyleSheet.flatten(tooltip?.props.style)

    expect(style.maxWidth).toBe(DESKTOP_COLUMN_WIDTH)
    expect(style.width).toBe('100%')
    expect(style.alignSelf).toBe('center')
  })
})
