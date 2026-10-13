import { renderWithProviders } from 'shared/mocks'
import { type OnboardingStep } from '../lib/scenarios'
import { TourTooltip } from './TourTooltip'

const HINT = 'Выполните действие, чтобы продолжить'
const NEXT_LABEL = 'Далее'
const PLAIN_STEP: OnboardingStep = { text: 'текст', title: 'Заголовок' }
const WAIT_STEP: OnboardingStep = { text: 'текст', title: 'Заголовок', waitFor: 'paused' }

const renderTooltip = (step: OnboardingStep, isWaitSatisfied: boolean) =>
  renderWithProviders(
    <TourTooltip
      index={1}
      total={3}
      step={step}
      onNext={jest.fn()}
      onPrev={jest.fn()}
      onClose={jest.fn()}
      isWaitSatisfied={isWaitSatisfied}
    />,
  )

describe('<TourTooltip>', () => {
  test('shows the primary button for a step without a wait condition', async () => {
    const { getByText, queryByText } = await renderTooltip(PLAIN_STEP, false)

    expect(getByText(NEXT_LABEL)).toBeTruthy()
    expect(queryByText(HINT)).toBeNull()
  })

  test('hides the primary button and shows the hint while waiting', async () => {
    const { getByText, queryByText } = await renderTooltip(WAIT_STEP, false)

    expect(queryByText(NEXT_LABEL)).toBeNull()
    expect(getByText(HINT)).toBeTruthy()
    expect(getByText('Назад')).toBeTruthy()
  })

  test('shows the primary button once the wait condition is satisfied', async () => {
    const { getByText, queryByText } = await renderTooltip(WAIT_STEP, true)

    expect(getByText(NEXT_LABEL)).toBeTruthy()
    expect(queryByText(HINT)).toBeNull()
  })
})
