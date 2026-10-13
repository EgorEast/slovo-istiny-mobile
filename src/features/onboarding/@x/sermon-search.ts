// Кросс-импорт по конвенции FSD `@x`: features/sermon-search оборачивает заголовок
// группы результатов поиска в OnboardingTarget. Прямой импорт barrel
// `features/onboarding` затянул бы в граф поиска весь онбординг (тур, оверлеи).
export { OnboardingTarget } from '../ui/OnboardingTarget'
