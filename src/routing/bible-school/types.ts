import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type BibleSchoolStackParamList = {
  Home: undefined;
};

export type BibleSchoolStackScreenProps<Screen extends keyof BibleSchoolStackParamList> =
  NativeStackScreenProps<BibleSchoolStackParamList, Screen>;

export type BibleSchoolStackNavProp<Screen extends keyof BibleSchoolStackParamList> =
  NativeStackNavigationProp<BibleSchoolStackParamList, Screen>;
