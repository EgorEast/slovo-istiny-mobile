import { type OnboardingScenario } from '../scenarios'

const ADD_MENU_TARGET_ID = 'playlist.row-menu-add'

export const playlistAddScenario: OnboardingScenario = {
  description: 'Через меню строки проповеди',
  icon: 'add-circle-outline',
  id: 'playlist-add',
  screens: ['/listen/playlist'],
  steps: [
    {
      text: 'Чтобы добавить проповедь в плейлист, сначала нужно вызвать меню проповеди — долгим нажатием на строку или тапом по кнопке с тремя точками. Мы сделаем это за вас: нажмите «Далее».',
      title: 'Добавление в плейлист',
    },
    {
      tapActionId: 'open-playlist-row-menu',
      tapTargetId: 'playlist.first-row',
      targetId: 'playlist.first-row',
      text: 'Открываем меню строки…',
      title: 'Меню проповеди',
    },
    {
      targetId: ADD_MENU_TARGET_ID,
      text: 'Пункт «Добавить в плейлист» открывает выбор плейлистов — им мы воспользуемся в конце.',
      title: 'Добавить в плейлист',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.row-menu-remove',
      text: 'Для своих плейлистов — убирает проповедь из этого плейлиста.',
      title: 'Удалить из плейлиста',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.row-menu-mark',
      text: 'Отмечает проповедь прослушанной.',
      title: 'Пометить прослушанной',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.row-menu-history-remove',
      text: 'Убирает проповедь из истории прослушивания.',
      title: 'Удалить из истории',
    },
    {
      tapActionId: 'press-row-menu-add',
      tapTargetId: ADD_MENU_TARGET_ID,
      targetId: ADD_MENU_TARGET_ID,
      text: 'Выбираем «Добавить в плейлист»…',
      title: 'Добавляем',
    },
    {
      interactive: true,
      text: 'Отметьте галочками плейлисты и сохраните — проповедь появится в выбранных плейлистах.',
      title: 'Отметьте плейлисты',
    },
  ],
  title: 'Добавление в плейлист',
}
