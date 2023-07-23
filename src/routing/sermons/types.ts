import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Playlist, SermonData } from 'shared';

export enum SermonsStackParamName {
  SermonsTabs = 'SermonsTabs',
  Playlist = 'Playlist',
  SermonCard = 'SermonCard',
}

export type SermonsStackParamList = {
  [SermonsStackParamName.SermonsTabs]: undefined;
  [SermonsStackParamName.Playlist]: Playlist;
  [SermonsStackParamName.SermonCard]: SermonData;
};

export type SermonsStackScreenProps<Screen extends keyof SermonsStackParamList> =
  NativeStackScreenProps<SermonsStackParamList, Screen>;

export type SermonsStackNavProp<Screen extends keyof SermonsStackParamList> =
  NativeStackNavigationProp<SermonsStackParamList, Screen>;
