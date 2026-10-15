import { type OnboardingScenario } from '../scenarios'

export const backupScenario: OnboardingScenario = {
  description: 'Копии, автосинхронизация, папка',
  icon: 'save-outline',
  id: 'backup',
  steps: [
    {
      route: '/listen',
      text: 'Сейчас покажем, где включается резервное копирование: экран «Ещё» → «Настройки». Нажмите «Далее».',
      title: 'Резервное копирование',
    },
    {
      route: '/more',
      tapTargetId: 'more.settings-item',
      targetId: 'more.settings-item',
      text: 'Чтобы открыть настройки, тапните по этому пункту.',
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
