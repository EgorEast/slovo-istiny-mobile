import { ButtonProps, StyleSheet, Text, TouchableOpacity } from 'react-native';

export const Button = ({ title, color, disabled, ...rest }: ButtonProps) => (
  <TouchableOpacity
    style={disabled ? { ...styles.button, backgroundColor: 'gray' } : styles.button}
    disabled={disabled}
    {...rest}
  >
    <Text style={{ ...styles.text, color }}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    height: 10,
    padding: 2.5,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
  text: {
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
