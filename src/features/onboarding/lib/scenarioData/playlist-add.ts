import { type OnboardingScenario } from '../scenarios'

const ADD_MENU_TARGET_ID = 'playlist.row-menu-add'
const ADD_MODAL_FAVORITES_TARGET_ID = 'playlist.add-modal-favorites'
const ADD_MODAL_SAVE_TARGET_ID = 'playlist.add-modal-save'

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
      text: 'Пункт «Добавить в плейлист» открывает выбор плейлистов.',
      title: 'Добавить в плейлист',
    },
    {
      tapActionId: 'press-row-menu-add',
      tapTargetId: ADD_MENU_TARGET_ID,
      targetId: ADD_MENU_TARGET_ID,
      text: 'Выбираем «Добавить в плейлист»…',
      title: 'Добавляем',
    },
    {
      actionOnEnterId: 'check-add-modal-favorites',
      targetId: ADD_MODAL_FAVORITES_TARGET_ID,
      text: 'Галочка добавляет проповедь в плейлист, снятие — удаляет из него. Отмечаем «Избранные»…',
      title: 'Отметьте «Избранные»',
    },
    {
      interactive: true,
      targetId: ADD_MODAL_SAVE_TARGET_ID,
      text: 'Кнопка «Сохранить» применит изменения — проповедь появится в «Избранных». Если добавлять не хотите, просто закройте окно.',
      title: 'Сохранить',
    },
  ],
  title: 'Добавление в плейлист',
}
