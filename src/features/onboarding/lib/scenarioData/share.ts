import { type OnboardingScenario } from '../scenarios'

export const shareScenario: OnboardingScenario = {
  description: 'QR-код и ссылка',
  icon: 'qr-code-outline',
  id: 'share',
  screens: ['/more', '/share'],
  steps: [
    {
      text: 'Сейчас перейдём на экран «Ещё» и откроем страницу «Поделиться приложением» — нажмите «Далее».',
      title: 'Поделиться приложением',
    },
    {
      route: '/more',
      tapTargetId: 'tab.more',
      targetId: 'tab.more',
      text: 'Переходим на экран «Ещё»…',
      title: 'Экран «Ещё»',
    },
    {
      tapTargetId: 'more.share-item',
      targetId: 'more.share-item',
      text: 'Чтобы открыть страницу поделиться, тапните по этому пункту.',
      title: 'Поделиться приложением',
    },
    {
      route: '/share',
      targetId: 'share.qr',
      text: 'Покажите код с телефона получателя — откроется сайт, где можно скачать приложение или открыть веб-версию.',
      title: 'QR-код',
    },
    {
      targetId: 'share.copy',
      text: 'Кнопка копирует ссылку вместе с описанием приложения — можно сразу пересылать в мессенджер.',
      title: 'Скопировать ссылку',
    },
    {
      text: 'Сайт из трёх разделов: сайт проекта, веб-версия для браузера и последняя сборка приложения для Android.',
      title: 'Что откроется по ссылке',
    },
  ],
  title: 'Поделиться приложением',
}
