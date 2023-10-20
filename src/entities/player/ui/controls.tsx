import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import type { PlaylistData, SermonData } from 'shared';
import { CURRENT_AUDIO, LAST_SOUND_DURATION, LAST_SOUND_POSITION, isNonNullable } from 'shared';
import { usePlayer } from '../hooks';
import { usePlayerStore } from '../model';
import { schedulePushNotification } from '../utils';
import { PlayerControlButton } from './control-button';

export type AudioPlayerData = Omit<SermonData, 'audioUrl'> & {
  audioUrl: string;
  previewUrl?: string;
};

export enum PlayerControlsSize {
  Large = 35,
  Small = 20,
}

export type ControlsNames = 'backward' | 'forward' | 'next' | 'play' | 'prev';

interface PlayerControlsProps {
  currentAudio: AudioPlayerData | null;
  currentPlaylist: PlaylistData | null;
  excludeButtons?: ControlsNames[];
  setCurrentAudio: (audio: AudioPlayerData) => void;
  size?: PlayerControlsSize;
  style?: StyleProp<ViewStyle>;
}

export const PlayerControls = ({
  currentAudio,
  currentPlaylist,
  excludeButtons,
  setCurrentAudio,
  size = PlayerControlsSize.Large,
  style,
}: PlayerControlsProps) => {
  const {
    changeProgressPosition,
    duration,
    getPlaybackStatus,
    pause,
    play,
    position,
    recreateSound,
  } = usePlayer({
    onGetPlaybackStatus: (position, duration) => {
      if (position >= duration && !isNotAvailableNext) {
        switchToNextTrack();
      }
    },
  });

  const {
    isPlayingCurrentAudio,
    setCurrentSound,
    setCurrentSoundDuration,
    setCurrentSoundPosition,
  } = usePlayerStore((store) => ({
    isPlayingCurrentAudio: store.isPlayingCurrentAudio,
    setCurrentSound: store.setCurrentSound,
    setCurrentSoundDuration: store.setCurrentSoundDuration,
    setCurrentSoundPosition: store.setCurrentSoundPosition,
  }));

  const rewindTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    backward: isBackwardExcluded,
    forward: isForwardExcluded,
    next: isNextExcluded,
    play: isPlayExcluded,
    prev: isPrevExcluded,
  } = excludeButtons?.reduce<Partial<Record<ControlsNames, true>>>(
    (acc, currentValue) => ({ ...acc, [currentValue]: true }),
    {},
  ) || {};

  const indexOfCurrentAudioInPlaylist =
    currentAudio && currentPlaylist?.list.findIndex(({ id }) => currentAudio.id === id);

  const changeValue = 15000;

  const audioTwistDelay = 300;

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
    await AsyncStorage.setItem(CURRENT_AUDIO, JSON.stringify(newAudio));

    const newSound = await recreateSound(newAudio.audioUrl);
    newSound && setCurrentSound(newSound);

    await schedulePushNotification({
      body: newAudio.description || '',
      subtitle: currentPlaylist.title || 'Проповедует Андрей Вовк',
      title: newAudio.title,
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

  useEffect(() => {
    (async () => {
      const [[, lastSoundPosition], [, lastSoundDuration]] = await AsyncStorage.multiGet([
        LAST_SOUND_POSITION,
        LAST_SOUND_DURATION,
      ]);

      setCurrentSoundPosition(Number(lastSoundPosition));
      setCurrentSoundDuration(Number(lastSoundDuration));
    })();
  }, []);

  return (
    <View style={[styles.controlsContainer, style]} testID='controls-container'>
      {!isPrevExcluded && (
        <PlayerControlButton
          isDisabled={indexOfCurrentAudioInPlaylist === 0 || !currentAudio}
          onPress={switchToPreviousTrack}
          size={size}
          testID='prev-button'
          type='prev'
        />
      )}
      {!isBackwardExcluded && (
        <PlayerControlButton
          isDisabled={position <= 0 || !currentAudio}
          onLongPress={rewindAudio}
          onPress={switchTrackBackward}
          onPressOut={onPressOutAudioTwistButton}
          size={size}
          testID='backward-button'
          type='backward'
        />
      )}
      {!isPlayExcluded && (
        <PlayerControlButton
          isDisabled={!currentAudio}
          onPress={togglePlay}
          size={size * 2}
          testID='play-button'
          type={isPlayingCurrentAudio ? 'pause' : 'play'}
        />
      )}
      {!isForwardExcluded && (
        <PlayerControlButton
          isDisabled={position >= duration || !currentAudio}
          onLongPress={fastForwardAudio}
          onPress={switchTrackForward}
          onPressOut={onPressOutAudioTwistButton}
          size={size}
          testID='forward-button'
          type='forward'
        />
      )}
      {!isNextExcluded && (
        <PlayerControlButton
          isDisabled={isNotAvailableNext || !currentAudio}
          onPress={switchToNextTrack}
          size={size}
          type='next'
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
});
