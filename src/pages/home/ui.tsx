import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenProps } from 'shared';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const HomeScreen: FC<ScreenProps<'Home'>> = () => (
  <View style={styles.screen}>
    <Text>HomeScreen</Text>
  </View>
);
