import { ActivityIndicator, StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
});

export const Loading = () => (
  <View style={styles.loading}>
    <ActivityIndicator size='large' />
  </View>
);
