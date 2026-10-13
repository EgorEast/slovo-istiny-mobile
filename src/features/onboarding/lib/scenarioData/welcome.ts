import { type OnboardingScenario } from '../scenarios'

export const welcomeScenario: OnboardingScenario = {
  description: 'Короткая экскурсия по приложению',
  icon: 'sparkles-outline',
  id: 'welcome',
  sinceVersion: '0.27.0',
  steps: [
    {
      route: '/listen',
      text: 'Проведём короткую экскурсию по приложению — это займёт минуту.',
      title: 'Добро пожаловать!',
    },
    {
      targetId: 'listen.sections',
      text: 'Горизонтальные подборки: разделы, проповедники и рекомендации. Листайте вбок.',
      title: 'Разделы проповедей',
    },
    {
      targetId: 'listen.search-toggle',
      text: 'Нажмите на иконку поиска, чтобы найти проповедь по названию, проповеднику или разделу.',
      title: 'Поиск',
    },
    {
      targetId: 'listen.my-playlists',
      text: 'Ваши подборки проповедей. Добавляйте новые через меню любой проповеди.',
      title: 'Мои плейлисты',
    },
    {
      route: '/more',
      tapTargetId: 'tab.more',
      targetId: 'more.menu',
      text: 'Здесь история прослушивания, офлайн-режим и настройки.',
      title: 'Таб «Ещё»',
    },
    {
      route: '/settings',
      tapTargetId: 'more.settings-item',
      targetId: 'settings.theme',
      text: 'Светлая и тёмная темы, а на Android 12+ — динамические цвета Material You.',
      title: 'Оформление',
    },
    {
      route: '/settings',
      targetId: 'settings.tours',
      text: 'Подсказки и автопоказ обзоров можно полностью отключить в настройках.',
      title: 'Всё под контролем',
    },
  ],
  title: 'Добро пожаловать',
}
