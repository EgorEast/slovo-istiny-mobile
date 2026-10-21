import { StyleSheet, View } from 'react-native'
import { INDENTS } from '../../theme/themed'
import { SliderItemText } from '../slider-item-text/slider-item-text'
import {
  type SliderItemTextAlign,
  SliderItemTextBackgroundStyle,
} from '../slider-item-text/slider-item-text.types'
import { TITLE_ON_CARD_TEST_ID } from './card-overlay'
import { DESCRIPTION_ON_CARD_BACKGROUND } from './description-on-card'

// Title drawn over an icon card: centered for the `on` placement, bottom-anchored
// for `bothOnAndUnder` on the shared dark scrim.
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
    {isBottom ? (
      <View style={styles.bottomStack}>
        <SliderItemText
          title={title}
          style={styles.bottomStackItem}
          titleTextAlign={titleTextAlign}
          backgroundStyle={SliderItemTextBackgroundStyle.Dark}
        />
      </View>
    ) : (
      <SliderItemText
        title={title}
        titleTextAlign={titleTextAlign}
        backgroundStyle={backgroundStyle}
      />
    )}
  </View>
)

const styles = StyleSheet.create({
  bottomStack: {
    backgroundColor: DESCRIPTION_ON_CARD_BACKGROUND,
    paddingHorizontal: INDENTS.middle,
    paddingVertical: INDENTS.middle,
    width: '100%',
  },
  // Гасит собственную плашку и отступы SliderItemText: общий фон даёт bottomStack.
  bottomStackItem: { backgroundColor: 'transparent', padding: 0 },
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
