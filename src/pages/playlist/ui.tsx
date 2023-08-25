import React from 'react';
import { StyleSheet } from 'react-native';
import { ListenStackScreenProps, ListenStackParamName } from 'routing';
import { Playlist } from 'widgets';
import { OnPressPlaylistItem, PlaylistItem } from 'features';
import { COLORS, FONT_SIZES, INDENTS } from 'shared';

export const PlaylistScreen: React.FC<ListenStackScreenProps<ListenStackParamName.Playlist>> = ({
  route,
  navigation: { navigate },
}) => {
  const { title, list, previewUrl, description } = route.params;

  const onPressPlaylistItem: OnPressPlaylistItem = (sermon) => {
    console.log('onPressPlaylistItem: ');
    navigate;
  };

  return (
    <Playlist
      style={styles.container}
      title={title}
      previewUrl={previewUrl}
      description={description}
    >
      {list.map((sermon, index) => (
        <PlaylistItem
          key={`TouchableItem-${index}`}
          index={index}
          sermon={sermon}
          onPressPlaylistItem={onPressPlaylistItem}
        />
      ))}
    </Playlist>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.h2,
    paddingVertical: INDENTS.main,
  },
  list: { paddingLeft: INDENTS.main },
});
