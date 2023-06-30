import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SceneMap } from 'react-native-tab-view';
import { ListSermons } from 'features';

const FirstRoute = () => (
  <ScrollView style={styles.scroll}>
    <ListSermons />
  </ScrollView>
);

const SecondRoute = () => <View style={{ flex: 1, backgroundColor: '#673ab7' }} />;

export const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    minHeight: '100%',
  },
});
