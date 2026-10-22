import { type OnboardingScenario } from '../scenarios'

export const playerActionsScenario: OnboardingScenario = {
  description: 'Сердечко и плюсик в полноэкранном плеере',
  icon: 'heart-circle-outline',
  id: 'player-actions',
  scope: 'player',
  steps: [
    {
      text: 'Покажем две кнопки рядом с меню плеера: сердечко добавляет проповедь в «Избранные», а плюсик открывает выбор плейлистов. Нажмите «Далее».',
      title: 'Избранное и плейлисты',
    },
    {
      targetId: 'player-fullscreen.favorite',
      text: 'Сердечко добавляет текущую проповедь в «Избранные» (или убирает из них).',
      title: 'В избранное',
    },
    {
      targetId: 'player-fullscreen.add-to-playlist',
      text: 'Плюсик открывает выбор плейлистов: отметьте нужные и сохраните.',
      title: 'В плейлист',
    },
  ],
  title: 'Избранное и плейлисты',
}
