import { type OnboardingScenario } from '../scenarios'

export const playlistMenuScenario: OnboardingScenario = {
  description: 'Управление плейлистом и проповедями',
  icon: 'menu-outline',
  id: 'playlist-menu',
  screens: ['/listen/playlist'],
  steps: [
    {
      targetId: 'playlist.playback',
      text: 'Кнопка запускает плейлист: «Начать прослушивание» — с первой проповеди, «Продолжить» — с места, где вы остановились.',
      title: 'Начать или продолжить',
    },
    {
      tapActionId: 'open-playlist-menu',
      tapTargetId: 'playlist.menu',
      targetId: 'playlist.menu',
      text: 'Открываем меню и покажем каждый пункт по отдельности.',
      title: 'Меню плейлиста',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.menu-share',
      text: 'Отправьте плейлист ссылкой — например, в мессенджер.',
      title: 'Поделиться',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.menu-add-all',
      text: 'Добавьте все проповеди плейлиста в другой ваш плейлист.',
      title: 'Добавить все проповеди',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.menu-publish',
      text: 'Опубликуйте плейлист в общих — доступно администраторам для локальных плейлистов.',
      title: 'Опубликовать',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.menu-offline-add',
      text: 'Скачайте все проповеди плейлиста для офлайна; когда плейлист полностью в офлайне — пункт уберёт его из офлайна.',
      title: 'Офлайн',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.menu-offline-remove',
      text: '«Удалить из офлайн все» освобождает место: убирает все проповеди плейлиста из офлайна. Пункт неактивен, если удалять пока нечего.',
      title: 'Удалить из офлайна',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.menu-history-mark',
      text: 'Пометить все проповеди прослушанными или удалить плейлист из истории прослушивания.',
      title: 'История',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.menu-clear',
      text: 'Убрать все проповеди из плейлиста, не удаляя сам плейлист.',
      title: 'Очистка',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.menu-delete',
      text: 'Удалить плейлист целиком. Эти действия необратимы — действует подтверждающий диалог.',
      title: 'Удаление',
    },
    {
      interactive: true,
      targetId: 'playlist.first-row',
      text: 'Зажмите строку проповеди или нажмите «⋯» — откроется меню: «Добавить в плейлист», «Удалить из плейлиста» (для своих плейлистов), «Пометить прослушанной», «Удалить из истории».',
      title: 'Меню проповеди',
    },
  ],
  title: 'Экран плейлиста',
}
