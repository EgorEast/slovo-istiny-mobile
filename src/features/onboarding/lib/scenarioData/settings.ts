import { type OnboardingScenario } from '../scenarios'

const SETTINGS_ITEM_TARGET_ID = 'more.settings-item'

export const settingsScenario: OnboardingScenario = {
  description: 'Оформление, сервер и бэкапы',
  icon: 'settings-outline',
  id: 'settings',
  screens: ['/more', '/settings'],
  steps: [
    {
      route: '/more',
      tapTargetId: SETTINGS_ITEM_TARGET_ID,
      targetId: SETTINGS_ITEM_TARGET_ID,
      text: 'Чтобы открыть настройки, тапните по пункту «Настройки». Нажмите «Далее».',
      title: 'Настройки',
    },
    {
      route: '/settings',
      tapTargetId: SETTINGS_ITEM_TARGET_ID,
      targetId: 'settings.theme',
      text: 'Светлая и тёмная темы.',
      title: 'Оформление',
    },
    {
      skipIfMissing: true,
      targetId: 'settings.dynamic-colors',
      text: 'На Android 12+ тема может подстраиваться под цвета системы — Material You.',
      title: 'Динамические цвета',
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
