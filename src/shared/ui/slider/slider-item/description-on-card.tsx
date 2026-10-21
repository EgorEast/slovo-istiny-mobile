import { StyleSheet, Text, View } from 'react-native'
import { COLORS } from '../../theme/colors'
import { INDENTS } from '../../theme/themed'
import { getDescriptionOnCardFontSize, getDescriptionOnCardNumberOfLines } from './slider-item.lib'
import { type SliderItemSize, type SliderItemTransform } from './slider-item.types'

// Translucent scrim keeps the white description readable over any artwork.
// Shared with the bottom-stacked title so both sit on the same plate.
export const DESCRIPTION_ON_CARD_BACKGROUND = 'rgba(0, 0, 0, 0.55)'

// Плашка описания плейлиста: прижата к низу карточки, тёмный полупрозрачный
// фон, белый текст, масштабируемый от размера карточки. `plain` убирает
// собственную плашку — описание ложится внутрь общей плашки с заголовком.
export const DescriptionOnCard = ({
  plain,
  size,
  text,
  transform,
}: {
  plain?: boolean
  size: SliderItemSize
  text: string
  transform?: SliderItemTransform
}) => (
  <View style={plain ? styles.plainComponent : styles.component}>
    <Text
      numberOfLines={getDescriptionOnCardNumberOfLines(size, transform)}
      style={[styles.text, { fontSize: getDescriptionOnCardFontSize(size) }]}
    >
      {text}
    </Text>
  </View>
)

const styles = StyleSheet.create({
  component: {
    backgroundColor: DESCRIPTION_ON_CARD_BACKGROUND,
    paddingHorizontal: INDENTS.middle,
    paddingVertical: INDENTS.low,
    width: '100%',
  },
  plainComponent: { width: '100%' },
  text: { color: COLORS.white, fontWeight: '500' },
})
