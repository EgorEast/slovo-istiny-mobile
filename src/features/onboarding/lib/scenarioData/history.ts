import { type OnboardingScenario } from '../scenarios'

export const historyScenario: OnboardingScenario = {
  description: 'Что вы слушали и когда',
  homeRoute: '/history',
  icon: 'time-outline',
  id: 'history',
  steps: [
    {
      text: 'Все прослушанные проповеди сохраняются здесь автоматически.',
      title: 'История прослушивания',
    },
    {
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
