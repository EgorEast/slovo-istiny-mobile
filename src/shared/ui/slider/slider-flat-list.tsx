import { useMemo, useState } from 'react'
import { FlatList, type GestureResponderEvent, Platform, StyleSheet } from 'react-native'
import { INDENTS } from '../theme/themed'
import { useWebSliderScroll } from './lib/useWebSliderScroll'
import { SliderColumn } from './slider-column'
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
import {
  buildSliderSnapOffsets,
  getSliderCardLayout,
  getSliderLayoutViewport,
} from './slider-layout.lib'

const MAX_FLING_TRAVEL_VIEWPORT_RATIO = 1.2 // потолок инерции — как decelerationRate='fast' на нативе

interface SliderFlatListProps<D extends object> {
  borderRadius?: boolean
  descriptionBackgroundStyle?: SliderItemTextBackgroundStyle
  isDescriptionTitleOnSlideLarge?: boolean
  items: SliderItemsElement<D>[]
  itemsRows: number
  itemsSize: SliderItemSize
  onPressItem?: (data: D, event: GestureResponderEvent) => void
  titleTextAlign?: SliderItemTextAlign
  transform?: SliderItemTransform
  whereIsSlideTitleLocated?: WhereIsSlideTitleLocated
}

export const SliderFlatList = <D extends object>({
  borderRadius,
  descriptionBackgroundStyle,
  isDescriptionTitleOnSlideLarge,
  items,
  itemsRows,
  itemsSize,
  onPressItem,
  titleTextAlign,
  transform,
  whereIsSlideTitleLocated,
}: SliderFlatListProps<D>) => {
  // The mapper clamps itemsRows, but a rogue value must never reach layout
  // arithmetic (Infinity/negative column counts would crash rendering).
  const rows = Number.isFinite(itemsRows) && itemsRows >= 1 ? itemsRows : 1
  const columnCount = Math.ceil(items.length / rows)

  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>(undefined)
  const layoutViewport = getSliderLayoutViewport(measuredWidth)
  const layout = useMemo(
    () => getSliderCardLayout(itemsSize, layoutViewport),
    [itemsSize, layoutViewport],
  )
  // maxOffset must use the real measured width: the card layout stays capped
  // so proportions survive on wide screens, but the scrollable run does not.
  const snapOffsets = useMemo(
    () =>
      buildSliderSnapOffsets({
        columnCount,
        contentWidth: (columnCount - 1) * layout.stride + layout.cardWidth,
        peekInset: layout.visiblePeek + INDENTS.middle,
        stride: layout.stride,
        viewportWidth: measuredWidth ?? layoutViewport,
      }),
    [columnCount, layout, layoutViewport, measuredWidth],
  )
  const maxTravelPx = MAX_FLING_TRAVEL_VIEWPORT_RATIO * (measuredWidth ?? layoutViewport)
  const { onScroll, scrollRef } = useWebSliderScroll(snapOffsets, maxTravelPx)

  // Contiguous slices keep the round-robin row order: column c holds items
  // c*rows..c*rows+rows-1, stacked bottom-up (column-reverse) like today.
  const columns = useMemo(
    () =>
      Array.from({ length: columnCount }, (_, columnIndex) =>
        items.slice(columnIndex * rows, columnIndex * rows + rows),
      ),
    [columnCount, items, rows],
  )

  // The last column has no trailing gap, so its width differs from the stride.
  const getColumnWidth = (index: number) =>
    index === columnCount - 1 ? layout.cardWidth : layout.stride

  return (
    <FlatList
      horizontal
      {...(Platform.OS === 'web' ? { style: styles.touchArbitration } : {})}
      data={columns}
      windowSize={5}
      ref={scrollRef}
      decelerationRate='fast'
      snapToOffsets={snapOffsets}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, index) => String(index)}
      initialNumToRender={Math.ceil(layoutViewport / layout.stride) + 1}
      onLayout={event => setMeasuredWidth(event.nativeEvent.layout.width)}
      {...(onScroll === undefined ? {} : { onScroll, scrollEventThrottle: 16 })}
      getItemLayout={(_, index) => ({
        index,
        length: getColumnWidth(index),
        offset: layout.stride * index,
      })}
      renderItem={({ index, item: column }) => (
        <SliderColumn
          column={column}
          itemsSize={itemsSize}
          transform={transform}
          onPressItem={onPressItem}
          borderRadius={borderRadius}
          cardWidth={layout.cardWidth}
          titleTextAlign={titleTextAlign}
          cellWidth={getColumnWidth(index)}
          whereIsSlideTitleLocated={whereIsSlideTitleLocated}
          descriptionBackgroundStyle={descriptionBackgroundStyle}
          isDescriptionTitleOnSlideLarge={isDescriptionTitleOnSlideLarge}
        />
      )}
    />
  )
}

// pan-y: горизонталь — JS-скролл слайдера, вертикаль — нативный скролл/PTR.
const styles = StyleSheet.create({ touchArbitration: { touchAction: 'pan-y' } })
