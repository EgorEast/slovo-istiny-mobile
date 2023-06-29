import React, { FC } from 'react';
import { StyleSheet, TextInputProps, View, ViewStyle } from 'react-native';
import { Input, SearchButton, SearchButtonProps } from 'shared';

const styles = StyleSheet.create({
  searchInput: {
    flexDirection: 'row',
    height: 39,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    borderStyle: 'solid',
  },

  input: {
    flex: 1,
    paddingTop: 7,
    paddingBottom: 9,
    paddingHorizontal: 10,
  },
});

export const SearchInput: FC<SearchInputProps> = ({ placeholder, onPress, addStyles = {} }) => (
  <View style={{ ...styles.searchInput, ...addStyles }}>
    <Input style={styles.input} placeholder={placeholder} />
    <SearchButton onPress={onPress} />
  </View>
);

// Types
type SearchInputProps = Pick<TextInputProps & SearchButtonProps, 'placeholder' | 'onPress'> & {
  addStyles?: ViewStyle;
};
