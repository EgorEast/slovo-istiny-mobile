import { type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { CoverImage } from '../../cover-image/cover-image'
import { PlaylistLetterAvatar } from '../../PlaylistLetterAvatar'
import { useTheme } from '../../theme/ThemeContext/useTheme'
import { SliderItemText } from '../slider-item-text/slider-item-text'
import {
  type SliderItemTextAlign,
  type SliderItemTextBackgroundStyle,
} from '../slider-item-text/slider-item-text.types'
import { CardOverlay, TITLE_ON_CARD_TEST_ID } from './card-overlay'
import { type SliderItemSize } from './slider-item.types'

// Artwork area of a slider card: an icon node, a real cover, or — when neither
// is present — the shared blurred letter tile. The on-card title/description
// overlay is layered inside each branch so it always sits above the artwork;
// the letter is dropped under an on-card title so the two never overlap.
export const SliderItemArtwork = ({
  artwork,
  artworkIcon,
  cardDescription,
  conditionSize,
  descriptionBackgroundStyle,
  imageHeight,
  isTitleOnCard,
  radius,
  size,
  title,
  titleTextAlign,
}: {
  artwork: null | string | undefined
  artworkIcon?: ReactNode
  cardDescription?: string
  conditionSize: number
  descriptionBackgroundStyle?: SliderItemTextBackgroundStyle
  imageHeight: number
  isTitleOnCard: boolean
  radius: number
  size: SliderItemSize
  title?: string
  titleTextAlign?: SliderItemTextAlign
}) => {
  const { currentTheme } = useTheme()

  const overlay =
    isTitleOnCard || cardDescription ? (
      <CardOverlay
        size={size}
        title={title ?? ''}
        description={cardDescription}
        titleTextAlign={titleTextAlign}
        backgroundStyle={descriptionBackgroundStyle}
      />
    ) : null

  if (artworkIcon)
    return (
      <View
        style={[
          styles.iconBackground,
          { backgroundColor: currentTheme.surface, borderRadius: radius, height: imageHeight },
        ]}
      >
        {artworkIcon}
        {isTitleOnCard ? (
          <View style={styles.titleOnIconCard} testID={TITLE_ON_CARD_TEST_ID}>
            <SliderItemText
              title={title ?? ''}
              titleTextAlign={titleTextAlign}
              backgroundStyle={descriptionBackgroundStyle}
            />
          </View>
        ) : null}
      </View>
    )

  if (artwork)
    return (
      <CoverImage
        uri={artwork}
        style={[styles.imageBackground, { borderRadius: radius, height: imageHeight }]}
      >
        {overlay}
      </CoverImage>
    )

  return (
    <View
      style={[
        styles.imageBackground,
        styles.letterBackground,
        { borderRadius: radius, height: imageHeight },
      ]}
    >
      <PlaylistLetterAvatar
        fill
        title={title ?? ''}
        size={conditionSize}
        borderRadius={radius}
        showLetter={!isTitleOnCard}
      />
      {overlay}
    </View>
  )
}

const styles = StyleSheet.create({
  iconBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    // Clips a full-bleed artwork icon to the card's rounded corners.
    overflow: 'hidden',
    width: '100%',
  },
  imageBackground: { justifyContent: 'flex-end', width: '100%' },
  letterBackground: { overflow: 'hidden' },
  titleOnIconCard: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
})
