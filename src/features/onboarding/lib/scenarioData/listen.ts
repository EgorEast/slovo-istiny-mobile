import { type OnboardingScenario } from '../scenarios'
import { SECTION_TITLES_TOKEN } from '../sectionTitlesPhrase'

export const listenScenario: OnboardingScenario = {
  description: 'Поиск, разделы и плеер',
  icon: 'headset-outline',
  id: 'listen',
  screens: ['/listen'],
  steps: [
    {
      route: '/listen',
      tapTargetId: 'tab.listen',
      targetId: 'listen.sections',
      text: `Горизонтальные подборки: ${SECTION_TITLES_TOKEN}. Листайте вбок.`,
      title: 'Разделы проповедей',
    },
    {
      targetId: 'listen.search-toggle',
      text: 'Нажмите на иконку поиска, чтобы найти проповедь по названию, проповеднику или разделу.',
      title: 'Поиск',
    },
    {
      targetId: 'listen.my-playlists',
      text: 'Ваши подборки проповедей. Добавляйте новые через меню любой проповеди.',
      title: 'Мои плейлисты',
    },
    {
      targetId: 'player.mini',
      text: 'Управляйте воспроизведением с любого экрана. Нажмите на него, чтобы открыть полный плеер.',
      title: 'Мини-плеер',
    },
  ],
  title: 'Как слушать проповеди',
}
