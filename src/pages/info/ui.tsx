import React, { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView } from 'react-native-tab-view';
import { InfoStackScreenProps } from 'shared';
import { renderScene } from './scene';

export const Info: React.FC<InfoStackScreenProps<'Home'>> = () => {
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);

  const routes = useMemo(
    () => [
      { key: 'first', title: 'First' },
      { key: 'second', title: 'Second' },
    ],
    [],
  );

  return (
    <SafeAreaView style={styles.info}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  info: {
    flex: 1,
  },
});
