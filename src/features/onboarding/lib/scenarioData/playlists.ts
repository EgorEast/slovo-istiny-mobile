import { type OnboardingScenario } from '../scenarios'

export const playlistsScenario: OnboardingScenario = {
  description: 'Создание и управление подборками',
  icon: 'albums-outline',
  id: 'playlists',
  steps: [
    {
      route: '/listen',
      targetId: 'listen.my-playlists',
      text: 'Последние плейлисты на главном экране. Кнопка «Все» открывает полный список.',
      title: 'Мои плейлисты',
    },
    {
      route: '/listen/my-playlists',
      targetId: 'playlists.create',
      text: 'Нажмите кнопку создания — плейлист появится в списке. Имя можно изменить в любой момент.',
      title: 'Создать плейлист',
    },
    {
      text: 'Откройте меню проповеди и выберите «В плейлист» — можно добавить в несколько сразу.',
      title: 'Добавить проповедь',
    },
  ],
  title: 'Плейлисты',
}
