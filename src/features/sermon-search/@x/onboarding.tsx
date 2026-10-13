// Кросс-импорт по конвенции FSD `@x`: заголовок группы результатов поиска должен
// быть подсвечиваемой целью онбординга. Файл адаптирует владельческий
// SearchGroupHeader к OnboardingTarget, не втягивая онбординг в остальной слайс.
import { OnboardingTarget } from 'features/onboarding/@x/sermon-search'
import { SearchGroupHeader } from '../ui/SearchGroupHeader'

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
