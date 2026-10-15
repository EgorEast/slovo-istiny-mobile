import { type OnboardingScenario } from '../scenarios'

export const shareScenario: OnboardingScenario = {
  description: 'QR-код и ссылка',
  globalFallback: true,
  icon: 'qr-code-outline',
  id: 'share',
  screens: ['/more', '/share'],
  steps: [
    {
      text: 'Сейчас перейдём на экран «Ещё» — тапнем по нему — и откроем страницу «Поделиться приложением». Нажмите «Далее».',
      title: 'Поделиться приложением',
    },
    {
      // Pure navigation: from a nested screen without a tab bar this returns to
      // «Ещё» first, so the tab entry below can register and blink the tab.
      route: '/more',
      text: 'Возвращаемся на экран «Ещё»…',
      title: 'Экран «Ещё»',
    },
    {
      // The «Ещё» tab is an entry transition (blink + navigation), not a card.
      route: '/more',
      tapTargetId: 'tab.more',
      text: 'Переходим на экран «Ещё»…',
      title: 'Экран «Ещё»',
    },
    {
      route: '/share',
      tapTargetId: 'more.share-item',
      text: 'Тапаем по пункту «Поделиться приложением»…',
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
