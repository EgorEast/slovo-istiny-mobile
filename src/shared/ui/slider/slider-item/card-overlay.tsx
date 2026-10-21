import { StyleSheet, View } from 'react-native'
import { INDENTS } from '../../theme/themed'
import { SliderItemText } from '../slider-item-text/slider-item-text'
import {
  type SliderItemTextAlign,
  SliderItemTextBackgroundStyle,
} from '../slider-item-text/slider-item-text.types'
import { DESCRIPTION_ON_CARD_BACKGROUND, DescriptionOnCard } from './description-on-card'
import { getTitleAreaStyleName } from './slider-item.lib'
import { type SliderItemSize } from './slider-item.types'

// Контейнер оверлея не несёт собственного текста — служит якорем для тестов,
// различающих заголовок «на карточке» и заголовок «под карточкой».
export const TITLE_ON_CARD_TEST_ID = 'slider-item-title-on-card'

// Слой поверх обложки: заголовок центрируется в оставшейся области, описание
// прижато к низу карточки. Пустой заголовок/описание не рендерятся. В
// bottom-режиме заголовок и описание делят одну тёмную плашку.
export const CardOverlay = ({
  backgroundStyle,
  description,
  isTitleBottom,
  size,
  title,
  titleTextAlign,
}: {
  backgroundStyle?: SliderItemTextBackgroundStyle
  description?: string
  isTitleBottom?: boolean
  size: SliderItemSize
  title: string
  titleTextAlign?: SliderItemTextAlign
}) => {
  const isStackedTitle = !!title && !!isTitleBottom

  return (
    <View style={styles.overlayContent}>
      {title ? (
        <View testID={TITLE_ON_CARD_TEST_ID} style={styles[getTitleAreaStyleName(!!isTitleBottom)]}>
          {isStackedTitle ? (
            <View style={styles.bottomStack}>
              <SliderItemText
                title={title}
                style={styles.bottomStackItem}
                titleTextAlign={titleTextAlign}
                backgroundStyle={SliderItemTextBackgroundStyle.Dark}
              />
              {description ? <DescriptionOnCard plain size={size} text={description} /> : null}
            </View>
          ) : (
            <SliderItemText
              title={title}
              titleTextAlign={titleTextAlign}
              backgroundStyle={backgroundStyle}
            />
          )}
        </View>
      ) : null}
      {!isStackedTitle && description ? <DescriptionOnCard size={size} text={description} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  bottomStack: {
    backgroundColor: DESCRIPTION_ON_CARD_BACKGROUND,
    gap: INDENTS.lowest,
    paddingHorizontal: INDENTS.middle,
    paddingVertical: INDENTS.middle,
    width: '100%',
  },
  // Гасит собственную плашку и отступы SliderItemText: общий фон даёт bottomStack.
  bottomStackItem: { backgroundColor: 'transparent', padding: 0 },
  overlayContent: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  titleBottomArea: { width: '100%' },
  titleOnCardArea: { flex: 1, justifyContent: 'center', width: '100%' },
})
