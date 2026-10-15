import { renderWithProviders } from 'shared/mocks'
import { type OnboardingStep } from '../lib/scenarios'
import { TourTooltip } from './TourTooltip'

const HINT = 'Выполните действие, чтобы продолжить'
const PASSIVE_HINT = 'Загружаем офлайн-кэш…'
const NEXT_LABEL = 'Далее'
const PLAIN_STEP: OnboardingStep = { text: 'текст', title: 'Заголовок' }
const WAIT_STEP: OnboardingStep = { text: 'текст', title: 'Заголовок', waitFor: 'paused' }
const PASSIVE_WAIT_STEP: OnboardingStep = {
  text: 'текст',
  title: 'Заголовок',
  waitFor: 'offlineLoaded',
}

const renderTooltip = (step: OnboardingStep, isWaitSatisfied: boolean) =>
  renderWithProviders(
    <TourTooltip
      step={step}
      displayIndex={1}
      displayTotal={3}
      onNext={jest.fn()}
      onPrev={jest.fn()}
      onClose={jest.fn()}
      isLastVisible={false}
      isFirstVisible={false}
      isWaitSatisfied={isWaitSatisfied}
    />,
  )

const renderTooltipDeck = (
  overrides: Partial<{
    displayIndex: number
    displayTotal: number
    isFirstVisible: boolean
    isLastVisible: boolean
  }>,
) =>
  renderWithProviders(
    <TourTooltip
      isWaitSatisfied
      step={PLAIN_STEP}
      onNext={jest.fn()}
      onPrev={jest.fn()}
      onClose={jest.fn()}
      displayIndex={overrides.displayIndex ?? 0}
      displayTotal={overrides.displayTotal ?? 3}
      isLastVisible={overrides.isLastVisible ?? false}
      isFirstVisible={overrides.isFirstVisible ?? false}
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

  test('shows the passive hint for a background wait instead of the action hint', async () => {
    const { getByText, queryByText } = await renderTooltip(PASSIVE_WAIT_STEP, false)

    expect(queryByText(NEXT_LABEL)).toBeNull()
    expect(getByText(PASSIVE_HINT)).toBeTruthy()
    expect(queryByText(HINT)).toBeNull()
  })

  test('shows the primary button once the wait condition is satisfied', async () => {
    const { getByText, queryByText } = await renderTooltip(WAIT_STEP, true)

    expect(getByText(NEXT_LABEL)).toBeTruthy()
    expect(queryByText(HINT)).toBeNull()
  })

  test('shows the real step numbers of the surviving deck', async () => {
    const { getByText } = await renderTooltipDeck({
      displayIndex: 6,
      displayTotal: 7,
      isLastVisible: true,
    })

    expect(getByText('Шаг 7 из 7')).toBeTruthy()
    expect(getByText('Готово')).toBeTruthy()
  })

  test('hides the back button on the first visible step', async () => {
    const { getByText, queryByText } = await renderTooltipDeck({ isFirstVisible: true })

    expect(queryByText('Назад')).toBeNull()
    expect(getByText(NEXT_LABEL)).toBeTruthy()
  })
})
