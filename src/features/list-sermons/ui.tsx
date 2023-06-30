import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SermonItem } from 'entities';
import { useSermons } from './model';

export const ListSermons = () => {
  const sermons = useSermons((state) => state.sermons);

  return (
    <View style={styles.list}>
      {sermons.map(({ id, title, url }) => (
        <SermonItem key={`sermon-${id}`} title={title} url={url} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
