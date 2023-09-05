import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SermonData } from 'entities';
import { INDENTS } from 'shared';
import { useAudio } from './useAudio';

const windowWidth = Dimensions.get('window').width;

// const useWindowDimensions()

// Не тестируется также из-за ошибки в библиотеке expo-av

export type AudioPlayerData = Omit<SermonData, 'audioUrl'> & {
  audioUrl: string;
  previewUrl?: string;
};

interface AudioPlayerProps {
  data: AudioPlayerData;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ data: { audioUrl, previewUrl } }) => {
  const { play, pause, duration, position, isPlaying } = useAudio({
    audioUrl,
  });

  const togglePlay = async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  return (
    <View style={styles.container}>
      {previewUrl && (
        <ImageBackground
          style={styles.preview}
          imageStyle={styles.previewImage}
          source={{ uri: previewUrl }}
        />
      )}

      <TouchableOpacity onPress={togglePlay}>
        <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
        <Text>{duration}</Text>
        <Text>{position}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: INDENTS.main },
  preview: {
    width: windowWidth - INDENTS.main,
    height: windowWidth - INDENTS.main,
  },

  previewImage: { height: '100%', width: '100%' },
});