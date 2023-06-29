import { FC } from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from 'widgets/app-header';
import { ScreenProps } from 'shared';

export const HomeScreen: FC<ScreenProps<'Home'>> = () => (
  <SafeAreaView>
    <ScrollView>
      <AppHeader />
      <Text>HomeScreen</Text>
    </ScrollView>
  </SafeAreaView>
);
