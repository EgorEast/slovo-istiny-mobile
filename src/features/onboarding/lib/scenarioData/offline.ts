import { type OnboardingScenario } from '../scenarios'

export const offlineScenario: OnboardingScenario = {
  description: 'Прослушивание без интернета',
  homeRoute: '/offline',
  icon: 'cloud-offline-outline',
  id: 'offline',
  steps: [
    {
      targetId: 'offline.caching-switch',
      text: 'Переключатель включает автоматическое сохранение проповедей на устройство.',
      title: 'Автокэширование',
    },
    {
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
