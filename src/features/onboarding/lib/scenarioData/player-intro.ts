import { type OnboardingScenario } from '../scenarios'

export const playerIntroScenario: OnboardingScenario = {
  description: 'Управление воспроизведением',
  icon: 'musical-notes-outline',
  id: 'player-intro',
  scope: 'player',
  steps: [
    {
      areaTargetIds: ['player-fullscreen.edge-back', 'player-fullscreen.edge-forward'],
      text: 'Подсвеченные полосы у краёв кликабельны: тап — шаг назад/вперёд; зажмите и держите — непрерывная перемотка.',
      title: 'Края экрана',
    },
    {
      targetId: 'player-fullscreen.controls',
      text: 'Переключайте проповеди кнопками назад/вперёд. Тап по центру экрана — пауза и воспроизведение.',
      title: 'Кнопки плеера',
    },
    {
      targetId: 'player-fullscreen.repeat',
      text: 'Переключайте повтор: выключен → текущая проповедь → весь плейлист.',
      title: 'Зацикливание',
    },
    {
      targetId: 'player-fullscreen.playlist',
      text: 'Откройте текущий плейлист в нижней шторке — переключайтесь между проповедями свайпом.',
      title: 'Плейлист',
    },
    {
      targetId: 'player-fullscreen.menu',
      text: 'В меню — подробнее о проповеди, скорость воспроизведения, настройки звука и офлайн-доступ.',
      title: 'Меню',
    },
  ],
  title: 'Экран плеера',
}
