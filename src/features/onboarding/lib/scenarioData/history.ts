import { type OnboardingScenario } from '../scenarios'

export const historyScenario: OnboardingScenario = {
  description: 'Что вы слушали и когда',
  icon: 'time-outline',
  id: 'history',
  steps: [
    {
      route: '/more',
      tapTargetId: 'tab.more',
      targetId: 'more.history-item',
      text: 'История открывается из меню «Ещё» — здесь она пополняется автоматически.',
      title: 'История прослушивания',
    },
    {
      route: '/history',
      tapTargetId: 'more.history-item',
      targetId: 'history.rows',
      text: 'Нажмите на запись, чтобы продолжить с того же места. Через меню записи проповедь можно добавить в плейлист.',
      title: 'Записи',
    },
    {
      targetId: 'history.header-menu',
      text: 'Очистка истории — в меню шапки экрана.',
      title: 'Меню экрана',
    },
  ],
  title: 'История прослушивания',
}
