// Кросс-импорт по конвенции FSD `@x`: заголовок группы результатов поиска должен
// быть подсвечиваемой целью онбординга, а интерактивный шаг ждёт активного поиска
// (запрос ≥ MIN_QUERY_LENGTH). Файл адаптирует владельческий SearchGroupHeader к
// OnboardingTarget и отдаёт онбордингу условие `useIsSearchActive`, не втягивая
// остальной слайс поиска в его модульный граф.
import { OnboardingTarget } from 'features/onboarding/@x/sermon-search'
import { SearchGroupHeader } from '../ui/SearchGroupHeader'

// eslint-disable-next-line react-refresh/only-export-components -- @x bridge: the component adapter and the onboarding wait hook share this consumer-named entry point
export { useIsSearchActive } from '../lib/useIsSearchActive'

export const OnboardingSearchGroupHeader = ({
  count,
  label,
  onPress,
  targetId,
}: {
  count: number
  label: string
  onPress: () => void
  targetId: string
}) => (
  <OnboardingTarget id={targetId}>
    <SearchGroupHeader count={count} label={label} onPress={onPress} />
  </OnboardingTarget>
)
