import { type OnboardingScenario } from '../scenarios'

export const playlistsScenario: OnboardingScenario = {
  description: 'Создание и управление подборками',
  homeRoute: '/listen',
  icon: 'albums-outline',
  id: 'playlists',
  steps: [
    {
      targetId: 'listen.my-playlists',
      text: 'Последние плейлисты на главном экране. Кнопка «Все» открывает полный список.',
      title: 'Мои плейлисты',
    },
    {
      text: 'В списке плейлистов нажмите кнопку создания. Имя можно изменить в любой момент.',
      title: 'Создать плейлист',
    },
    {
      text: 'Откройте меню проповеди и выберите «В плейлист» — можно добавить в несколько сразу.',
      title: 'Добавить проповедь',
    },
  ],
  title: 'Плейлисты',
}
