import { type OnboardingScenario } from '../scenarios'

export const playlistAddScenario: OnboardingScenario = {
  description: 'Через меню строки проповеди',
  icon: 'add-circle-outline',
  id: 'playlist-add',
  screens: ['/listen/playlist'],
  steps: [
    {
      interactive: true,
      targetId: 'playlist.first-row',
      text: 'Зажмите строку любой проповеди или нажмите «⋯» — откроется меню.',
      title: 'Меню проповеди',
    },
    {
      interactive: true,
      text: 'Выберите пункт «Добавить в плейлист».',
      title: 'Добавить в плейлист',
    },
    {
      interactive: true,
      text: 'Отметьте галочками плейлисты и сохраните — проповедь появится в выбранных плейлистах.',
      title: 'Отметьте плейлисты',
    },
  ],
  title: 'Добавление в плейлист',
}
