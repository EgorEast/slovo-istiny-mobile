import { type OnboardingScenario } from '../scenarios'

const MY_PLAYLISTS_ROUTE = '/listen/my-playlists'

export const playlistsScenario: OnboardingScenario = {
  description: 'Создание и управление подборками',
  icon: 'albums-outline',
  id: 'playlists',
  screens: ['/listen', MY_PLAYLISTS_ROUTE, '/listen/playlist-list'],
  steps: [
    {
      route: MY_PLAYLISTS_ROUTE,
      tapTargetId: 'listen.my-playlists-title',
      targetId: 'listen.my-playlists',
      text: 'Тап по заголовку раздела открывает полный список.',
      title: 'Мои плейлисты',
    },
    {
      route: MY_PLAYLISTS_ROUTE,
      targetId: 'playlists.create',
      text: 'Нажмите кнопку создания — плейлист появится в списке. Имя можно изменить в любой момент.',
      title: 'Создать плейлист',
    },
    {
      text: 'Откройте меню проповеди и выберите «В плейлист» — можно добавить в несколько сразу.',
      title: 'Добавить проповедь',
    },
  ],
  title: 'Мои плейлисты',
}
