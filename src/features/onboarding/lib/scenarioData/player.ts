import { type OnboardingScenario } from '../scenarios'

export const playerScenario: OnboardingScenario = {
  description: 'Выбор проповеди и управление',
  icon: 'play-circle-outline',
  id: 'player',
  screens: ['/listen'],
  steps: [
    {
      route: '/listen',
      tapTargetId: 'tab.listen',
      targetId: 'listen.sections',
      text: 'Нажмите на любую проповедь в любом разделе — она начнёт играть.',
      title: 'Выберите проповедь',
      waitFor: 'sermonSelected',
    },
    {
      targetId: 'player.mini',
      text: 'После выбора проповеди внизу появился мини-плеер. Он доступен с любого экрана.',
      title: 'Мини-плеер',
    },
    {
      targetId: 'player.mini-play-pause',
      text: 'Нажмите на кнопку паузы в мини-плеере.',
      title: 'Поставьте на паузу',
      waitFor: 'paused',
    },
    {
      tapActionId: 'expand-player',
      tapTargetId: 'player.mini',
      targetId: 'player.mini',
      text: 'Тап или свайп вверх по мини-плееру разворачивает его на весь экран. Показываем…',
      title: 'Полноэкранный плеер',
    },
  ],
  title: 'Плеер',
}
