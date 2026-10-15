import { type OnboardingScenario } from '../scenarios'

export const offlineScenario: OnboardingScenario = {
  description: 'Прослушивание без интернета',
  icon: 'cloud-offline-outline',
  id: 'offline',
  screens: ['/more', '/offline'],
  steps: [
    {
      text: 'Сейчас перейдём на экран «Ещё» — тапнем по нему — и откроем офлайн-режим. Нажмите «Далее».',
      title: 'Офлайн-режим',
    },
    {
      route: '/more',
      tapTargetId: 'tab.more',
      targetId: 'more.offline-item',
      text: 'Открываем раздел офлайн-кэша.',
      title: 'Офлайн-режим',
    },
    {
      route: '/offline',
      tapTargetId: 'more.offline-item',
      targetId: 'offline.caching-switch',
      text: 'Переключатель включает автоматическое сохранение проповедей на устройство.',
      title: 'Автокэширование',
      waitFor: 'offlineLoaded',
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
