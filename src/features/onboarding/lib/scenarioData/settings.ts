import { type OnboardingScenario } from '../scenarios'

export const settingsScenario: OnboardingScenario = {
  description: 'Оформление, сервер и бэкапы',
  icon: 'settings-outline',
  id: 'settings',
  steps: [
    {
      route: '/more',
      tapTargetId: 'tab.more',
      targetId: 'more.settings-item',
      text: 'Все настройки собраны в меню «Ещё».',
      title: 'Настройки',
    },
    {
      route: '/settings',
      tapTargetId: 'more.settings-item',
      targetId: 'settings.theme',
      text: 'Светлая и тёмная темы, а на Android 12+ — динамические цвета Material You.',
      title: 'Оформление',
    },
    {
      targetId: 'settings.haptics',
      text: 'Короткий отклик на основные действия в приложении.',
      title: 'Виброотклик',
    },
    {
      targetId: 'settings.backup',
      text: 'Сохраняйте плейлисты, историю и настройки в файл и переносите между устройствами.',
      title: 'Резервные копии',
    },
    {
      targetId: 'settings.tours',
      text: 'Здесь можно полностью отключить подсказки и автопоказ обзоров.',
      title: 'Обзоры и подсказки',
    },
    {
      targetId: 'settings.server',
      text: 'Адрес сервера с проповедями. Не меняйте без необходимости.',
      title: 'Сервер',
    },
  ],
  title: 'Настройки и резервные копии',
}
