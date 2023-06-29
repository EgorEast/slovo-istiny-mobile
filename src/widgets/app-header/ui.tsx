import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SearchOnSite } from 'features';
import { TOP_BACK_IMAGE } from './config';

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
});

export const AppHeader = () => (
  <View>
    <Image style={styles.image} source={{ uri: TOP_BACK_IMAGE }} />
    <SearchOnSite />
  </View>
);
