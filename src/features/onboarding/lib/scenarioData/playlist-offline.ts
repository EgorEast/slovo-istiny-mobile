import { type OnboardingScenario } from '../scenarios'

export const playlistOfflineScenario: OnboardingScenario = {
  description: 'Офлайн-кеш плейлиста',
  icon: 'cloud-download-outline',
  id: 'playlist-offline',
  screens: ['/listen/playlist'],
  steps: [
    {
      text: 'Покажем, как слушать плейлист без интернета: скачаем его проповеди в кеш. Нажмите «Далее».',
      title: 'Прослушивание без интернета',
    },
    {
      tapActionId: 'open-playlist-menu',
      tapTargetId: 'playlist.menu',
      text: 'Открываем меню плейлиста…',
      title: 'Меню плейлиста',
    },
    {
      targetId: 'playlist.menu-offline-add',
      text: 'Открываем меню плейлиста — «Добавить все в офлайн» скачает все проповеди разом.',
      title: 'Весь плейлист в офлайн',
    },
    {
      targetId: 'playlist.menu-offline-remove',
      text: '«Удалить из офлайн все» освободит место, когда скачанное больше не нужно.',
      title: 'Удалить из офлайна',
    },
    {
      actionOnEnterId: 'close-playlist-menu',
      tapActionId: 'open-playlist-row-menu',
      tapTargetId: 'playlist.first-row',
      text: 'Открываем меню строки…',
      title: 'Меню проповеди',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.row-menu-offline-add',
      text: '«Добавить в офлайн» скачает эту проповедь. Если она уже в офлайне, пункт будет называться «Удалить из офлайна» — тап по нему уберёт проповедь из кеша.',
      title: 'Одна проповедь в офлайн',
    },
    {
      route: '/more',
      tapTargetId: 'tab.more',
      text: 'Переходим на экран «Ещё»…',
      title: 'Экран «Ещё»',
    },
    {
      targetId: 'more.offline-item',
      text: 'На экране «Офлайн» можно просмотреть скачанное и управлять проповедями в офлайне.',
      title: 'Управление офлайном',
    },
  ],
  title: 'Прослушивание без интернета',
}
