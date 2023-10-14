import React, { useRef } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { PlaylistData } from 'entities/playlist';
import { SermonData } from 'entities/sermon';
import { isNonNullable } from 'shared';
import { usePlayer } from '../hooks';
import { usePlayerStore } from '../model';
import { schedulePushNotification } from '../utils';
import { PlayerControlButton } from './control-button';

export type AudioPlayerData = Omit<SermonData, 'audioUrl'> & {
  audioUrl: string;
  previewUrl?: string;
};

interface PlayerControlsProps {
  currentAudio: AudioPlayerData | null;
  currentPlaylist: PlaylistData | null;
  setCurrentAudio: (audio: AudioPlayerData) => void;
  style?: StyleProp<ViewStyle>;
}

export const PlayerControls = ({
  currentAudio,
  currentPlaylist,
  setCurrentAudio,
  style,
}: PlayerControlsProps) => {
  const {
    play,
    pause,
    recreateSound,
    getPlaybackStatus,
    changeProgressPosition,
    position,
    duration,
  } = usePlayer({
    onGetPlaybackStatus: (position, duration) => {
      if (position >= duration && !isNotAvailableNext) {
        switchToNextTrack();
      }
    },
  });

  const { setCurrentSound, isPlayingCurrentAudio } = usePlayerStore((store) => ({
    setCurrentSound: store.setCurrentSound,
    isPlayingCurrentAudio: store.isPlayingCurrentAudio,
  }));

  const rewindTimerRef = useRef<NodeJS.Timeout | null>(null);

  const indexOfCurrentAudioInPlaylist =
    currentAudio && currentPlaylist?.list.findIndex(({ id }) => currentAudio.id === id);

  const changeValue = 15000;

  const audioTwistDelay = 300;

  const size = 35;

  const isNotAvailableNext =
    currentPlaylist && indexOfCurrentAudioInPlaylist === currentPlaylist.list.length - 1;

  const togglePlay = async () => {
    if (isPlayingCurrentAudio) {
      return await pause();
    }

    return await play();
  };

  const switchTrackForward = async () => {
    let updatedPosition = position + changeValue;

    if (updatedPosition <= 0) {
      updatedPosition = 0;
    }

    await changeProgressPosition(updatedPosition);
  };
  const switchTrackBackward = async () => {
    let updatedPosition = position - changeValue;

    if (updatedPosition > duration) {
      updatedPosition = duration;
    }

    await changeProgressPosition(updatedPosition);
  };

  const clearRewindInterval = () => {
    rewindTimerRef.current && clearInterval(rewindTimerRef.current);
  };

  const audioTwist = async (dir: 'next' | 'prev') => {
    let updatedPosition = position;

    await pause();

    rewindTimerRef.current = setInterval(() => {
      if (dir === 'next') {
        updatedPosition += changeValue;

        if (updatedPosition >= duration) {
          clearRewindInterval();
        }
      } else {
        updatedPosition -= changeValue;

        if (updatedPosition <= 0) {
          clearRewindInterval();
        }
      }

      if (updatedPosition <= 0) {
        updatedPosition = 0;
      } else if (updatedPosition > duration) {
        updatedPosition = duration;
      }

      changeProgressPosition(updatedPosition);
    }, audioTwistDelay);
  };

  const fastForwardAudio = async () => {
    await audioTwist('next');
  };

  const rewindAudio = async () => {
    await audioTwist('prev');
  };

  const toggleTrack = async (dir: 'next' | 'prev') => {
    if (!isNonNullable(indexOfCurrentAudioInPlaylist) || !currentPlaylist) {
      return;
    }

    const { audioUrl, ...otherProps } =
      currentPlaylist.list[
        dir === 'next' ? indexOfCurrentAudioInPlaylist + 1 : indexOfCurrentAudioInPlaylist - 1
      ];

    if (!audioUrl) {
      return;
    }

    const newAudio = { ...otherProps, audioUrl, previewUrl: currentPlaylist.previewUrl };

    setCurrentAudio(newAudio);

    const newSound = await recreateSound(newAudio.audioUrl);
    newSound && setCurrentSound(newSound);

    await schedulePushNotification({
      title: newAudio.title,
      subtitle: currentPlaylist.title || 'Проповедует Андрей Вовк',
      body: newAudio.description || '',
    });
    await play(newSound);
    await getPlaybackStatus(newSound);
  };

  const switchToNextTrack = async () => {
    await toggleTrack('next');
  };

  const switchToPreviousTrack = async () => {
    await toggleTrack('prev');
  };

  const onPressOutAudioTwistButton = async () => {
    await play();

    clearRewindInterval();
  };

  return (
    <View testID='controls-container' style={[styles.controlsContainer, style]}>
      <PlayerControlButton
        testID='prev-button'
        onPress={switchToPreviousTrack}
        type='prev'
        size={size}
        isDisabled={indexOfCurrentAudioInPlaylist === 0 || !currentAudio}
      />
      <PlayerControlButton
        testID='backward-button'
        onPress={switchTrackBackward}
        onLongPress={rewindAudio}
        onPressOut={onPressOutAudioTwistButton}
        type='backward'
        size={size}
        isDisabled={position <= 0 || !currentAudio}
      />
      <PlayerControlButton
        testID='play-button'
        onPress={togglePlay}
        type={isPlayingCurrentAudio ? 'pause' : 'play'}
        size={size * 2}
        isDisabled={!currentAudio}
      />
      <PlayerControlButton
        testID='forward-button'
        onPress={switchTrackForward}
        onLongPress={fastForwardAudio}
        onPressOut={onPressOutAudioTwistButton}
        type='forward'
        size={size}
        isDisabled={position >= duration || !currentAudio}
      />
      <PlayerControlButton
        onPress={switchToNextTrack}
        type='next'
        size={size}
        isDisabled={isNotAvailableNext || !currentAudio}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
});
