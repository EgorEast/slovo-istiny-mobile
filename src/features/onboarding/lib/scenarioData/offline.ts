import { type OnboardingScenario } from '../scenarios'

export const offlineScenario: OnboardingScenario = {
  description: 'Прослушивание без интернета',
  icon: 'cloud-offline-outline',
  id: 'offline',
  screens: ['/more', '/offline'],
  steps: [
    {
      route: '/more',
      tapTargetId: 'tab.more',
      targetId: 'more.offline-item',
      text: 'Раздел офлайн-кэша доступен на экране «Ещё».',
      title: 'Офлайн-режим',
    },
    {
      route: '/offline',
      tapTargetId: 'more.offline-item',
      targetId: 'offline.caching-switch',
      text: 'Переключатель включает автоматическое сохранение проповедей на устройство.',
      title: 'Автокэширование',
    },
    {
      route: '/offline',
      targetId: 'offline.rows',
      text: 'Проповеди, доступные без интернета. Управляйте каждой через её меню.',
      title: 'Загруженные проповеди',
    },
    {
      targetId: 'offline.header-menu',
      text: 'Здесь можно освободить место и очистить весь офлайн-кэш.',
      title: 'Меню экрана',
    },
  ],
  title: 'Офлайн-режим',
}
