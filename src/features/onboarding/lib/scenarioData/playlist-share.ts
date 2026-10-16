import { type OnboardingScenario } from '../scenarios'

export const playlistShareScenario: OnboardingScenario = {
  description: 'QR-код, копирование и отправка ссылки на плейлист',
  icon: 'share-outline',
  id: 'playlist-share',
  screens: ['/listen/playlist'],
  steps: [
    {
      text: 'Плейлист можно отправить ссылкой: покажем окно с QR-кодом, копированием и отправкой.',
      title: 'Поделиться плейлистом',
    },
    {
      tapActionId: 'open-playlist-menu',
      tapTargetId: 'playlist.menu',
      targetId: 'playlist.menu',
      text: 'Открываем меню плейлиста.',
      title: 'Меню плейлиста',
    },
    {
      skipIfMissing: true,
      targetId: 'playlist.menu-share',
      text: 'Пункт открывает окно «Поделиться плейлистом».',
      title: 'Поделиться',
    },
    {
      tapActionId: 'open-playlist-share',
      tapTargetId: 'playlist.menu-share',
      targetId: 'playlist.menu-share',
      text: 'Открываем окно и покажем кнопки.',
      title: 'Окно шеринга',
    },
    {
      presentOnTop: true,
      skipIfMissing: true,
      targetId: 'playlist.share-modal-qr',
      text: 'Наведите камеру на код — плейлист откроется у получателя со всеми проповедями и этим названием.',
      title: 'QR-код',
    },
    {
      presentOnTop: true,
      skipIfMissing: true,
      targetId: 'playlist.share-modal-copy',
      text: 'Скопируйте ссылку вместе с названием плейлиста и отправьте её в любом мессенджере.',
      title: 'Копировать ссылку',
    },
    {
      presentOnTop: true,
      skipIfMissing: true,
      targetId: 'playlist.share-modal-send',
      text: 'Кнопка открывает системное меню отправки — выберите приложение и получателя.',
      title: 'Отправить ссылку',
    },
    {
      actionOnEnterId: 'close-playlist-menu',
      presentOnTop: true,
      text: 'Наведите камеру на QR-код, скопируйте или отправьте ссылку — плейлист появится у получателя со всеми проповедями.',
      title: 'Готово',
    },
  ],
  title: 'Поделиться плейлистом',
}
