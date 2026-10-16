import { type OnboardingScenario } from '../scenarios'

export const backupScenario: OnboardingScenario = {
  description: 'Копии, автосинхронизация, папка',
  globalFallback: true,
  icon: 'save-outline',
  id: 'backup',
  screens: ['/more', '/settings'],
  steps: [
    {
      text: 'Сейчас покажем, где включается резервное копирование: тапнем по табу «Ещё», затем по пункту «Настройки». Нажмите «Далее».',
      title: 'Резервное копирование',
    },
    {
      // Entry transition: blinks the «Ещё» tab and navigates there (auto-skipped when
      // already on «Ещё»), so no separate pure-navigation return is needed.
      route: '/more',
      tapTargetId: 'tab.more',
      text: 'Переходим на экран «Ещё»…',
      title: 'Экран «Ещё»',
    },
    {
      // Screen-local intro: a same-screen start from «Ещё» lands here (the routeless
      // foreign-start intro and the tab entry above are skipped), so this card explains
      // the «Настройки» tap itself. Routeless — inherits «/more» from the tab entry above.
      text: 'Резервная копия сохраняет плейлисты, историю и настройки приложения в один файл. Чтобы сделать её, откроем настройки: тапнем по пункту «Настройки» в этом списке. Нажмите «Далее».',
      title: 'Резервная копия',
    },
    {
      route: '/more',
      tapTargetId: 'more.settings-item',
      targetId: 'more.settings-item',
      text: 'Открываем настройки.',
      title: 'Настройки',
    },
    {
      route: '/settings',
      tapTargetId: 'more.settings-item',
      targetId: 'settings.backup',
      text: 'Секция резервного копирования: плейлисты, история и настройки сохраняются в файл, который можно переносить между устройствами.',
      title: 'Резервное копирование',
    },
    {
      skipIfMissing: true,
      targetId: 'settings.backup-folder',
      text: 'Выберите папку, в которую будут сохраняться копии — например, на облачном диске. Где выбор папки недоступен, копия сохраняется через системный диалог файла.',
      title: 'Папка для копий',
    },
    {
      targetId: 'settings.backup-export',
      text: 'Сохраните копию вручную в выбранную папку в любой момент.',
      title: 'Сохранить копию',
    },
    {
      targetId: 'settings.backup-import',
      text: 'Из копии можно восстановить плейлисты, историю и настройки на этом устройстве.',
      title: 'Восстановление',
    },
    {
      skipIfMissing: true,
      targetId: 'settings.backup-autosync',
      text: 'Автосинхронизация обновляет копию при изменениях — вручную сохранять не нужно.',
      title: 'Автосинхронизация',
    },
  ],
  title: 'Резервное копирование',
}
