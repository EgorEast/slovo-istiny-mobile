import { type OnboardingScenario } from '../scenarios'

export const playerDescriptionScenario: OnboardingScenario = {
  description: 'Описание с кликабельными таймкодами',
  icon: 'information-circle-outline',
  id: 'player-description',
  scope: 'player',
  steps: [
    {
      tapActionId: 'open-player-menu',
      tapTargetId: 'player-fullscreen.menu',
      targetId: 'player-fullscreen.menu',
      text: 'Открываем меню плеера…',
      title: 'Меню',
    },
    {
      tapActionId: 'show-player-details',
      tapTargetId: 'player-fullscreen.menu-details',
      targetId: 'player-fullscreen.menu-details',
      text: 'Выбираем пункт «Подробнее»…',
      title: 'Подробнее',
    },
    {
      targetId: 'player-fullscreen.details',
      text: 'Описание проповеди. Таймкоды в нём кликабельны — нажмите на время, и плеер перемотает к этому моменту (если таймкоды заданы).',
      title: 'Таймкоды',
    },
  ],
  title: 'Подробнее и таймкоды',
}
