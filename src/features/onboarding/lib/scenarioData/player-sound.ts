import { type OnboardingScenario } from '../scenarios'

export const playerSoundScenario: OnboardingScenario = {
  description: 'Эквалайзер, громкость, баланс',
  icon: 'options-outline',
  id: 'player-sound',
  scope: 'player',
  steps: [
    {
      text: 'Покажем, где настройки звука: тур сам откроет меню — нажмите «Далее».',
      title: 'Настройка звука',
    },
    {
      tapActionId: 'open-player-menu',
      tapTargetId: 'player-fullscreen.menu',
      targetId: 'player-fullscreen.menu',
      text: 'Открываем меню плеера…',
      title: 'Меню',
    },
    {
      tapActionId: 'open-player-sound-settings',
      tapTargetId: 'player-fullscreen.menu-sound',
      targetId: 'player-fullscreen.menu-sound',
      text: 'Выбираем пункт «Настройки звука»…',
      title: 'Настройки звука',
    },
    {
      targetId: 'player-fullscreen.sound-sheet',
      text: 'В нижней шторке — эквалайзер, громкость и баланс каналов. Настройте звук под себя.',
      title: 'Эквалайзер и баланс',
    },
  ],
  title: 'Настройка звука',
}
