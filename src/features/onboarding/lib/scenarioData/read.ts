import { type OnboardingScenario } from '../scenarios'

export const readScenario: OnboardingScenario = {
  description: 'Библиотека книг',
  featureFlag: 'read',
  icon: 'book-outline',
  id: 'read',
  steps: [
    {
      route: '/read',
      tapTargetId: 'tab.read',
      text: 'Книги для чтения прямо в приложении: три подборки на любой этап подготовки.',
      title: 'Библиотека книг',
    },
    {
      targetId: 'read.notes',
      text: 'Практические материалы и заметки для подготовки проповеди.',
      title: 'Заметки для проповедников',
    },
    {
      targetId: 'read.verse-by-verse',
      text: 'Книги с последовательным разбором текстов.',
      title: 'Пословный разбор',
    },
    {
      targetId: 'read.topical',
      text: 'Подборки книг по темам.',
      title: 'Тематические книги',
    },
  ],
  title: 'Читать книги',
}
