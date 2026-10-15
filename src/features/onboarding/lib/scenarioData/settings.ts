import { type OnboardingScenario } from '../scenarios'

export const settingsScenario: OnboardingScenario = {
  description: 'Оформление, сервер и бэкапы',
  icon: 'settings-outline',
  id: 'settings',
  screens: ['/more', '/settings'],
  steps: [
    {
      text: 'Сейчас перейдём на экран «Ещё» — тапнем по нему — и откроем настройки. Нажмите «Далее».',
      title: 'Настройки',
    },
    {
      route: '/more',
      tapTargetId: 'tab.more',
      targetId: 'more.settings-item',
      text: 'Открываем настройки.',
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
      targetId: 'settings.tours',
      text: 'Здесь можно полностью отключить подсказки и автопоказ обзоров.',
      title: 'Обзоры и подсказки',
    },
    {
      targetId: 'settings.backup',
      text: 'Сохраняйте плейлисты, историю и настройки в файл и переносите между устройствами.',
      title: 'Резервные копии',
    },
    {
      targetId: 'settings.server',
      text: 'Адрес сервера с проповедями. Не меняйте без необходимости.',
      title: 'Сервер',
    },
  ],
  title: 'Настройки и резервные копии',
}
