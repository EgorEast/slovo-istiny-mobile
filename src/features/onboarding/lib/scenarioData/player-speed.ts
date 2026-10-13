import { type OnboardingScenario } from '../scenarios'

export const playerSpeedScenario: OnboardingScenario = {
  description: 'От 0,75× до 2×',
  icon: 'speedometer-outline',
  id: 'player-speed',
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
      tapActionId: 'open-player-speed-menu',
      tapTargetId: 'player-fullscreen.menu-speed',
      targetId: 'player-fullscreen.menu-speed',
      text: 'Выбираем пункт «Скорость воспроизведения»…',
      title: 'Скорость воспроизведения',
    },
    {
      targetId: 'player-fullscreen.speed-menu',
      text: 'Доступные скорости — от 0,75× до 2×. Выбранная скорость сохраняется для следующих проповедей.',
      title: 'Выберите скорость',
    },
  ],
  title: 'Скорость прослушивания',
}
