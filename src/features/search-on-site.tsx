import React, { FC } from 'react';
import { ViewStyle } from 'react-native';
import { SearchInput } from 'entities';

type SearchOnSiteProps = {
  style?: ViewStyle;
};

export const SearchOnSite: FC<SearchOnSiteProps> = ({ style }) => (
  <SearchInput placeholder='Поиск по сайту' style={style} />
);
