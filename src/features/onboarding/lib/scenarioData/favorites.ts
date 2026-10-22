import { type OnboardingScenario } from '../scenarios'

const ROW_FAVORITE_TARGET_ID = 'playlist.row-favorite'

export const favoritesScenario: OnboardingScenario = {
  description: 'Сердечко добавляет проповедь в «Избранные»',
  icon: 'heart-outline',
  id: 'favorites',
  screens: ['/listen/playlist'],
  steps: [
    {
      text: 'Сердечко у меню строки добавляет проповедь в «Избранные» — это ваш личный список, он всегда под рукой. Нажмите «Далее».',
      title: 'Избранное',
    },
    {
      skipIfMissing: true,
      targetId: ROW_FAVORITE_TARGET_ID,
      text: 'Нажмите сердечко у первой строки — проповедь появится в «Избранных». Повторное нажатие убирает её из избранного.',
      title: 'Сердечко на строке',
    },
    {
      text: '«Избранные» — обычный плейлист в разделе «Мои плейлисты»: его можно слушать, как любой другой.',
      title: 'Где искать',
    },
  ],
  title: 'Избранное',
}
