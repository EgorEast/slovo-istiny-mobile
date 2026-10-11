import { BlurTargetView, BlurView } from 'expo-blur'
import { useRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { CoverImage } from './cover-image/cover-image'
import { RADIUSES, useTheme } from './theme'
import { COLORS } from './theme/colors'
import { withAlpha } from './theme/withAlpha'

/**
 * Доля стороны плитки, которую занимает её содержимое (буква плейлиста или
 * иконка-маркер). Общая для карточек слайдера и строк списков, чтобы буква и
 * иконки были пропорциональны размеру плитки на обоих экранах.
 */
export const AVATAR_CONTENT_SIZE_RATIO = 0.4
const BLUR_INTENSITY = 50
const LIGHT_SCRIM_OPACITY = 0.6
const DARK_SCRIM_OPACITY = 0.5
const BACKGROUND_TEST_ID = 'playlist-letter-avatar-background'

/**
 * Квадратная плитка с буквой для плейлистов без обложки. За плиткой лежит
 * дефолтная обложка (`IMAGE_PLACEHOLDER`) под блюром и тематической вуалью —
 * светлая тема высветляет её под тёмную букву, тёмная затемняет под светлую, —
 * сверху первая заглавная буква названия. Фон плитки всегда тематический
 * (`currentTheme.skeleton`), а обложка проявляется фейдом (`CoverImage`),
 * поэтому плитка не мигает чёрным, пока картинка грузится или размонтируется.
 * @param root0 - Пропсы плитки.
 * @param root0.borderRadius - Скругление плитки (по умолчанию `RADIUSES.low`).
 * @param root0.fill - `true` — плитка заполняет родителя абсолютно (карточка
 * слайдера); `false` — фиксированный квадрат `size`×`size` (строка списка).
 * @param root0.showLetter - `false` — плитка остаётся, но буква не рендерится.
 * Нужно карточкам слайдера с заголовком «на карточке»: буква перекрывала бы
 * заголовок, поэтому она скрывается, а фон и вуаль остаются.
 * @param root0.size - Сторона квадрата в пикселях (база для размера буквы).
 * @param root0.title - Название плейлиста, из которого берётся буква.
 */
export const PlaylistLetterAvatar = ({
  borderRadius = RADIUSES.low,
  fill = false,
  showLetter = true,
  size,
  title,
}: {
  borderRadius?: number
  fill?: boolean
  showLetter?: boolean
  size: number
  title: string
}) => {
  const { currentTheme, isLight } = useTheme()
  const blurTargetRef = useRef<View>(null)
  const letter = title.trim().charAt(0).toUpperCase()
  const scrimColor = isLight
    ? withAlpha(COLORS.white, LIGHT_SCRIM_OPACITY)
    : withAlpha(COLORS.black, DARK_SCRIM_OPACITY)
  const tileSize = fill
    ? [StyleSheet.absoluteFill, { borderRadius }]
    : { borderRadius, height: size, width: size }

  return (
    <View style={[styles.tile, { backgroundColor: currentTheme.skeleton }, tileSize]}>
      <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
        <CoverImage testID={BACKGROUND_TEST_ID} style={StyleSheet.absoluteFill} />
      </BlurTargetView>
      <BlurView
        intensity={BLUR_INTENSITY}
        blurTarget={blurTargetRef}
        style={StyleSheet.absoluteFill}
        tint={isLight ? 'light' : 'dark'}
        blurMethod='dimezisBlurViewSdk31Plus'
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: scrimColor }]} />
      {showLetter ? (
        <Text
          style={[
            styles.letter,
            { color: currentTheme.text, fontSize: size * AVATAR_CONTENT_SIZE_RATIO },
          ]}
        >
          {letter}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  letter: {
    fontWeight: '600',
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
})
