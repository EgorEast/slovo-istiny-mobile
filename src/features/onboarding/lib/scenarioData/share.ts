import { type OnboardingScenario } from '../scenarios'

export const shareScenario: OnboardingScenario = {
  description: 'QR-код и ссылка',
  icon: 'qr-code-outline',
  id: 'share',
  screens: ['/share'],
  steps: [
    {
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
