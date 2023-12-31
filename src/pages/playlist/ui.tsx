import React from 'react';
import { StyleSheet } from 'react-native';
import { usePlayNewSermon } from 'features/sermon-player-controls';
import { Playlist } from 'entities/playlist';
import type {
  ListenStackParamName,
  ListenStackScreenProps,
  OnPressTouchableListItem,
  SermonData,
} from 'shared';
import { COLORS, FONT_SIZES, INDENTS, TouchableListItem } from 'shared';

export const PlaylistScreen: React.FC<ListenStackScreenProps<ListenStackParamName.Playlist>> = ({
  route: {
    params: { description, list, previewUrl, title },
    params: playlist,
  },
}) => {
  const playNewSermon = usePlayNewSermon();

  const onPressPlaylistItem: OnPressTouchableListItem<SermonData> = async (sermon) =>
    await playNewSermon({ playlist, sermon });

  return (
    <Playlist
      description={description}
      previewUrl={previewUrl}
      style={styles.content}
      title={title}
    >
      {list.map((sermon, index) => (
        <TouchableListItem
          data={sermon}
          key={`TouchableItem-${index}`}
          onPress={onPressPlaylistItem}
          previewPlaceholderText={`${index + 1}`}
        />
      ))}
    </Playlist>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    backgroundColor: 'white',
    flex: 1,
  },
  list: { paddingLeft: INDENTS.high },
  title: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.h2,
    paddingVertical: INDENTS.high,
  },
});
