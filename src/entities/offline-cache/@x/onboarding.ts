// Кросс-импорт по конвенции FSD `@x`: features/onboarding ждёт, пока офлайн-список
// загрузится, прежде чем подсветить переключатель кэширования. Прямой импорт barrel
// `entities/offline-cache` затянул бы expo-file-system в модульный граф онбординга.
export { offlineSermonsLoadedAtom } from '../model'
