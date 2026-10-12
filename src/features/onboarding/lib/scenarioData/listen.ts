import { type OnboardingScenario } from '../scenarios'

export const listenScenario: OnboardingScenario = {
  description: 'Поиск, разделы и плеер',
  homeRoute: '/listen',
  icon: 'headset-outline',
  id: 'listen',
  steps: [
    {
      route: '/listen',
      targetId: 'listen.sections',
      text: 'Горизонтальные подборки: разделы, проповедники и рекомендации. Листайте вбок.',
      title: 'Разделы проповедей',
    },
    {
      targetId: 'listen.search-toggle',
      text: 'Нажмите на иконку поиска, чтобы найти проповедь по названию, проповеднику или разделу.',
      title: 'Поиск',
    },
    {
      targetId: 'listen.continue-listening',
      text: 'Возвращайтесь к недослушанной проповеди — она запоминает место, где вы остановились.',
      title: 'Продолжить прослушивание',
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
