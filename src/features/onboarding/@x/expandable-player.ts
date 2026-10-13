// Кросс-импорт по конвенции FSD `@x`: widgets/expandable-player регистрирует
// tour-действия «открыть меню» и «показать Подробнее», чтобы тур мог сам выполнить
// действие шага. Прямой импорт barrel `features/onboarding` затянул бы тур и оверлеи
// в модульный граф плеера.
export { registerTourAction, unregisterTourAction } from '../lib/tourActions'
