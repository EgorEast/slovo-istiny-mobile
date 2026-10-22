import { type GestureResponderEvent, StyleSheet, View } from 'react-native'
import { INDENTS } from '../theme/themed'
import { SliderItem } from './slider-item/slider-item'
import {
  type SliderItemsElement,
  type SliderItemSize,
  type SliderItemTransform,
  type WhereIsSlideTitleLocated,
} from './slider-item/slider-item.types'
import {
  type SliderItemTextAlign,
  type SliderItemTextBackgroundStyle,
} from './slider-item-text/slider-item-text.types'

interface SliderColumnProps<D extends object> {
  borderRadius?: boolean
  cardWidth: number
  cellWidth: number
  column: SliderItemsElement<D>[]
  descriptionBackgroundStyle?: SliderItemTextBackgroundStyle
  isDescriptionTitleOnSlideLarge?: boolean
  itemsSize: SliderItemSize
  onPressItem?: (data: D, event: GestureResponderEvent) => void
  titleTextAlign?: SliderItemTextAlign
  transform?: SliderItemTransform
  whereIsSlideTitleLocated?: WhereIsSlideTitleLocated
}

const SLIDER_ITEM_ID = 'slider-item'

export const SliderColumn = <D extends object>({
  borderRadius,
  cardWidth,
  cellWidth,
  column,
  descriptionBackgroundStyle,
  isDescriptionTitleOnSlideLarge,
  itemsSize,
  onPressItem,
  titleTextAlign,
  transform,
  whereIsSlideTitleLocated,
}: SliderColumnProps<D>) => (
  <View style={{ width: cellWidth }}>
    <View style={styles.column}>
      {column.map(({ artwork, artworkIcon, data, description, title }, itemIndex) => (
        <SliderItem
          title={title}
          key={itemIndex}
          size={itemsSize}
          artwork={artwork}
          transform={transform}
          cardWidth={cardWidth}
          testID={SLIDER_ITEM_ID}
          artworkIcon={artworkIcon}
          description={description}
          borderRadius={borderRadius}
          titleTextAlign={titleTextAlign}
          onPress={event => onPressItem?.(data, event)}
          whereIsSlideTitleLocated={whereIsSlideTitleLocated}
          descriptionBackgroundStyle={descriptionBackgroundStyle}
          isDescriptionTitleOnSlideLarge={isDescriptionTitleOnSlideLarge}
        />
      ))}
    </View>
  </View>
)

const styles = StyleSheet.create({
  column: {
    flexDirection: 'column-reverse',
    gap: INDENTS.middle,
  },
})
