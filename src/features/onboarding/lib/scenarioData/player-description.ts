import { type OnboardingScenario } from '../scenarios'

export const playerDescriptionScenario: OnboardingScenario = {
  description: 'Описание с кликабельными таймкодами',
  icon: 'information-circle-outline',
  id: 'player-description',
  scope: 'player',
  steps: [
    {
      targetId: 'player-fullscreen.menu',
      text: 'Нажмите кнопку с точками над описанием проповеди.',
      title: 'Откройте меню',
    },
    {
      text: 'Пункт «Подробнее» раскрывает описание проповеди. Таймкоды в нём кликабельны — нажмите на время, чтобы перемотать к этому моменту.',
      title: 'Подробнее',
    },
  ],
  title: 'Подробнее и таймкоды',
}
