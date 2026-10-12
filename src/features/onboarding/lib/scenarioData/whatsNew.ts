import { type OnboardingScenario } from '../scenarios'

export const whatsNewScenario: OnboardingScenario = {
  description: 'Новинки этого релиза',
  homeRoute: '/listen',
  icon: 'gift-outline',
  id: 'whatsNew',
  sinceVersion: '0.27.0',
  steps: [
    {
      text: 'Теперь в шапке каждого экрана есть кнопка «?» — выберите сценарий и смотрите подсказки прямо на интерфейсе.',
      title: 'Обзоры в приложении',
    },
    {
      route: '/settings',
      targetId: 'settings.tours',
      text: 'Обзоры можно полностью отключить одним переключателем.',
      title: 'Управление в настройках',
    },
  ],
  title: 'Что нового',
}
