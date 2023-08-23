import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES } from 'shared/themed';
import { TouchableImageBackground } from 'shared/ui/touchable-image-background';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export enum SliderItemSize {
  Small = 'small',
  Middle = 'middle',
  Large = 'large',
}

interface SliderItemProps {
  previewURL: string;
  description?: string;
  size?: SliderItemSize;
}

export const SliderItem = ({
  previewURL,
  description,
  size = SliderItemSize.Small,
}: SliderItemProps) => {
  if (!previewURL) {
    return null;
  }

  return (
    <TouchableImageBackground
      style={[
        styles.component,
        {
          [SliderItemSize.Small]: styles.componentSmall,
          [SliderItemSize.Middle]: styles.componentMiddle,
          [SliderItemSize.Large]: styles.componentLarge,
        }[size],
      ]}
      imageStyle={styles.image}
      previewSrc={previewURL}
    >
      {description && (
        <View style={styles.description} testID='slider-item-description'>
          <Text style={styles.descriptionText} testID='slider-item-description-text'>
            {description}
          </Text>
        </View>
      )}
    </TouchableImageBackground>
  );
};

const componentLargeSize = windowWidth > windowHeight ? windowHeight - 50 : windowWidth - 50;

const styles = StyleSheet.create({
  component: {
    justifyContent: 'flex-end',
    borderRadius: 20,
  },
  componentSmall: {
    width: 150,
    height: 150,
  },
  componentMiddle: { width: 250, height: 250 },
  componentLarge: {
    width: componentLargeSize,
    height: componentLargeSize,
  },
  image: {
    borderRadius: 20,
  },

  description: {
    padding: 10,
    backgroundColor: COLORS.black,
    opacity: 0.7,
    maxHeight: '30%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  descriptionText: {
    fontSize: FONT_SIZES.h3,
    color: 'white',
  },
});