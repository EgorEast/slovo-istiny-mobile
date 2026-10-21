import { type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { CoverImage } from '../../cover-image/cover-image'
import { PlaylistLetterAvatar } from '../../PlaylistLetterAvatar'
import { useTheme } from '../../theme/ThemeContext/useTheme'
import {
  type SliderItemTextAlign,
  type SliderItemTextBackgroundStyle,
} from '../slider-item-text/slider-item-text.types'
import { CardOverlay } from './card-overlay'
import { type SliderItemSize, type SliderItemTransform } from './slider-item.types'
import { TitleOnIconCard } from './title-on-icon-card'

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
  isTitleOnCardBottom,
  radius,
  size,
  title,
  titleTextAlign,
  transform,
}: {
  artwork: null | string | undefined
  artworkIcon?: ReactNode
  cardDescription?: string
  conditionSize: number
  descriptionBackgroundStyle?: SliderItemTextBackgroundStyle
  imageHeight: number
  isTitleOnCard: boolean
  isTitleOnCardBottom: boolean
  radius: number
  size: SliderItemSize
  title?: string
  titleTextAlign?: SliderItemTextAlign
  transform?: SliderItemTransform
}) => {
  const { currentTheme } = useTheme()

  const overlay =
    isTitleOnCard || isTitleOnCardBottom || cardDescription ? (
      <CardOverlay
        size={size}
        title={title ?? ''}
        transform={transform}
        description={cardDescription}
        titleTextAlign={titleTextAlign}
        isTitleBottom={isTitleOnCardBottom}
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
        {isTitleOnCard || isTitleOnCardBottom ? (
          <TitleOnIconCard
            size={size}
            title={title ?? ''}
            isBottom={isTitleOnCardBottom}
            titleTextAlign={titleTextAlign}
            backgroundStyle={descriptionBackgroundStyle}
          />
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
        showLetter={!isTitleOnCard && !isTitleOnCardBottom}
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
})
