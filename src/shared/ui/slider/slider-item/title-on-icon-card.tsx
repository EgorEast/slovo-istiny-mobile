import { StyleSheet, View } from 'react-native'
import { SliderItemText } from '../slider-item-text/slider-item-text'
import {
  type SliderItemTextAlign,
  type SliderItemTextBackgroundStyle,
} from '../slider-item-text/slider-item-text.types'
import { TITLE_ON_CARD_TEST_ID } from './card-overlay'

// Title drawn over an icon card: centered for the `on` placement, bottom-anchored
// for `bothOnAndUnder`.
export const TitleOnIconCard = ({
  backgroundStyle,
  isBottom,
  title,
  titleTextAlign,
}: {
  backgroundStyle?: SliderItemTextBackgroundStyle
  isBottom: boolean
  title: string
  titleTextAlign?: SliderItemTextAlign
}) => (
  <View
    testID={TITLE_ON_CARD_TEST_ID}
    style={[styles.container, isBottom && styles.containerBottom]}
  >
    <SliderItemText
      title={title}
      titleTextAlign={titleTextAlign}
      backgroundStyle={backgroundStyle}
    />
  </View>
)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  containerBottom: { justifyContent: 'flex-end' },
})
