// Кросс-импорт по конвенции FSD `@x`: features/onboarding ждёт выбора проповеди
// и паузы в интерактивных шагах тура. Прямой импорт barrel `entities/player`
// затянул бы expo-audio в модульный граф онбординга (падало в тестах экранов).
export { currentAudioAtom, isPlayingAtom } from '../model'
