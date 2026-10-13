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
      tapActionId: 'type-search-query',
      text: 'Вводим «лицемерие»…',
      title: 'Вводим запрос',
    },
    {
      targetId: 'search-results.group-sermons',
      text: 'Найденное сгруппировано: проповеди, плейлисты и проповедники. Нажмите на заголовок группы с количеством — откроется полный список по ней.',
      title: 'Группы результатов',
    },
    {
      tapActionId: 'press-first-sermon',
      tapTargetId: 'search-results.first-sermon',
      targetId: 'search-results.first-sermon',
      text: 'Выбираем проповедь, которая входит в несколько плейлистов…',
      title: 'Выбираем проповедь',
    },
    {
      interactive: true,
      text: 'В окне «Выберите плейлист» нажмите на плейлист — проповедь заиграет из него. Если окно не появилось, проповедь уже играет из своего плейлиста.',
      title: 'Выберите плейлист',
    },
    {
      interactive: true,
      text: 'Зажмите строку проповеди или нажмите «⋯» — меню: добавить в плейлист, отметить прослушанной, удалить из истории.',
      title: 'Меню проповеди',
    },
  ],
  title: 'Результаты поиска',
}
