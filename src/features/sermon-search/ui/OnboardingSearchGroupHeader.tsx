import { OnboardingTarget } from 'features/onboarding/@x/sermon-search'
import { SearchGroupHeader } from './SearchGroupHeader'

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
