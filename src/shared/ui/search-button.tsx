import { ButtonProps, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SEARCH_ICON } from 'shared/config';

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: '100%',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    backgroundColor: '#ff602a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export const SearchButton = ({ disabled, ...rest }: SearchButtonProps) => (
  <TouchableOpacity
    style={disabled ? { ...styles.button, backgroundColor: 'gray' } : styles.button}
    disabled={disabled}
    {...rest}
  >
    <Image source={{ uri: SEARCH_ICON }} style={styles.image} />
    {/* <Text style={{ ...styles.text, color }}>{title}</Text> */}
  </TouchableOpacity>
);

// Types
export type SearchButtonProps = Omit<ButtonProps, 'title' | 'color'>;
