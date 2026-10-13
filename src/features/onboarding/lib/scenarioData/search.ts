import { type OnboardingScenario } from '../scenarios'

export const searchScenario: OnboardingScenario = {
  description: 'Группы и плейлисты',
  icon: 'search-outline',
  id: 'search',
  screens: ['/listen'],
  steps: [
    {
      tapActionId: 'open-listen-search',
      tapTargetId: 'listen.search-toggle',
      text: 'Открываем поиск…',
      title: 'Открываем поиск',
    },
    {
      text: 'Введите любой запрос — например, «молитва».',
      title: 'Введите запрос',
      waitFor: 'searchActive',
    },
    {
      targetId: 'search-results.group-sermons',
      text: 'Найденное сгруппировано: проповеди, плейлисты и проповедники. Нажмите на заголовок группы с количеством — откроется полный список по ней.',
      title: 'Группы результатов',
    },
    {
      text: 'Если проповедь входит в несколько плейлистов, при нажатии приложение спросит, из какого плейлиста воспроизвести.',
      title: 'Открыть в нужном плейлисте',
    },
    {
      text: 'Через меню строки (⋯ или долгое нажатие) добавьте проповедь в плейлист или управляйте историей.',
      title: 'Меню проповеди',
    },
  ],
  title: 'Результаты поиска',
}
