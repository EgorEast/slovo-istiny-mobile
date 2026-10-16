import { type OnboardingScenario } from '../scenarios'

const OFFLINE_ITEM_TARGET_ID = 'more.offline-item'

export const offlineScenario: OnboardingScenario = {
  description: 'Прослушивание без интернета',
  icon: 'cloud-offline-outline',
  id: 'offline',
  screens: ['/more', '/offline'],
  steps: [
    {
      route: '/more',
      tapTargetId: OFFLINE_ITEM_TARGET_ID,
      targetId: OFFLINE_ITEM_TARGET_ID,
      text: 'Чтобы перейти на экран офлайна, тапните по пункту «Офлайн». Нажмите «Далее».',
      title: 'Офлайн-режим',
    },
    {
      route: '/offline',
      tapTargetId: OFFLINE_ITEM_TARGET_ID,
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
