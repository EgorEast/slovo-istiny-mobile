import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { NavProp } from 'shared';
import { COLORS } from 'shared/config';

export const TextLinkToHome = () => {
  const { navigate } = useNavigation<NavProp<'Home'>>();

  const goToHome = () => {
    navigate('Home');
  };

  return (
    <TouchableOpacity style={styles.view} onPress={goToHome}>
      <Text style={styles.textFirst}>
        Более <Text style={styles.counter}>1 200</Text> проповедей, статей и книг
      </Text>
      <Text style={styles.textSecond}>Служение «слово истины»</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  view: {},
  textFirst: {
    fontSize: 15,
    textTransform: 'uppercase',
    color: COLORS.OnPrimary,
    textAlign: 'center',
  },
  textSecond: {
    fontSize: 24,
    textTransform: 'uppercase',
    color: COLORS.OnPrimary,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 30,
  },
  counter: {
    color: COLORS.Primary,
  },
});
