import { type OnboardingScenario } from '../scenarios'

export const playerSoundScenario: OnboardingScenario = {
  description: 'Эквалайзер, громкость, баланс',
  icon: 'options-outline',
  id: 'player-sound',
  scope: 'player',
  steps: [
    {
      targetId: 'player-fullscreen.menu',
      text: 'Нажмите кнопку с точками над описанием проповеди.',
      title: 'Откройте меню',
    },
    {
      text: 'Пункт «Настройки звука» открывает нижнюю шторку: эквалайзер, громкость и баланс каналов.',
      title: 'Настройки звука',
    },
  ],
  title: 'Настройка звука',
}
