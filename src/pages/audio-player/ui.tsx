import React, { useEffect } from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, View } from 'react-native';
import {
  SermonPlayerControls,
  useSermonPlayerControlsStore,
} from 'features/sermon-player-controls';
import { PlayerListenProgress } from 'entities/player';
import type { ListenStackParamName, ListenStackScreenProps } from 'shared';
import { FONT_SIZES, IMAGE_PLACEHOLDER, INDENTS, useAppStore } from 'shared';

const windowWidth = Dimensions.get('window').width;

export const AudioPlayerScreen: React.FC<
  ListenStackScreenProps<ListenStackParamName.AudioPlayer>
> = () => {
  const { currentAudio } = useSermonPlayerControlsStore((state) => ({
    currentAudio: state.currentAudio,
  }));

  const { setIsAudioPlayerMounted } = useAppStore((state) => ({
    setIsAudioPlayerMounted: state.setIsAudioPlayerMounted,
  }));

  useEffect(() => {
    setIsAudioPlayerMounted(true);

    return () => {
      setIsAudioPlayerMounted(false);
    };
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        alt='Sermon poster'
        imageStyle={styles.previewImage}
        source={{ uri: currentAudio?.previewUrl || IMAGE_PLACEHOLDER }}
        style={styles.preview}
      >
        {!currentAudio && <Text style={{ fontSize: FONT_SIZES.h1 }}>Проповедь не выбрана</Text>}
      </ImageBackground>

      <View style={styles.bottomContent}>
        <Text style={styles.title}>{currentAudio?.title || 'Проповедь не выбрана'}</Text>

        <PlayerListenProgress />

        <SermonPlayerControls style={styles.controlsContainer} />
      </View>
    </View>
  );
};

const previewSize = windowWidth - INDENTS.main * 2;

const styles = StyleSheet.create({
  bottomContent: {
    bottom: 0,
    position: 'absolute',
  },
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: INDENTS.main },

  controlsContainer: {
    marginVertical: INDENTS.main,
  },

  preview: {
    alignItems: 'center',
    height: previewSize * 1.2,
    justifyContent: 'center',

    marginTop: -(previewSize / 2),
    width: previewSize,
  },

  previewImage: { borderRadius: 20, height: '100%', width: '100%' },

  title: {
    fontSize: FONT_SIZES.h3,
    marginVertical: INDENTS.main,
  },
});
