import { type OnboardingScenario } from '../scenarios'

export const whatsNewScenario: OnboardingScenario = {
  description: 'Новинки этого релиза',
  icon: 'gift-outline',
  id: 'whatsNew',
  sinceVersion: '0.27.0',
  steps: [
    {
      targetId: 'app.help-button',
      text: 'Кнопка «?» в шапке каждого экрана открывает сценарии обзора — подсказки появляются прямо на интерфейсе.',
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
