import { type OnboardingScenario } from '../scenarios'

export const playerSpeedScenario: OnboardingScenario = {
  description: 'От 0,75× до 2×',
  icon: 'speedometer-outline',
  id: 'player-speed',
  scope: 'player',
  steps: [
    {
      targetId: 'player-fullscreen.menu',
      text: 'Нажмите кнопку с точками над описанием проповеди.',
      title: 'Откройте меню',
    },
    {
      text: 'Пункт «Скорость воспроизведения» открывает выбор от 0,75× до 2×. Выбранная скорость сохраняется для последующих проповедей.',
      title: 'Скорость воспроизведения',
    },
  ],
  title: 'Скорость прослушивания',
}
