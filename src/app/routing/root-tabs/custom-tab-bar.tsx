import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';
import { MiniPlayer } from 'widgets';
import { RootTabName, useAppStore } from 'shared';

export const CustomTabBar = ({
  descriptors,
  insets,
  navigation,
  state,
  state: {
    routes: { [state.index]: currentTab },
  },
}: BottomTabBarProps) => {
  const { isAudioPlayerMounted } = useAppStore(store => ({
    isAudioPlayerMounted: store.isAudioPlayerMounted,
  }));

  return (
    <View>
      {!(currentTab.name === RootTabName.Listen && isAudioPlayerMounted) && <MiniPlayer />}
      <BottomTabBar
        descriptors={descriptors}
        insets={insets}
        navigation={navigation}
        state={state}
      />
      {/* <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderTopWidth: 1,
          shadowColor: 'transparent',
          padding: 10,
        }}
      >
        {state.routes.map(({ name, key, params }) => {
          const { options } = descriptors[key];
          const { tabBarIcon, tabBarActiveTintColor, tabBarInactiveTintColor } = options;

          const isActive = key === currentTab.key;

          const color = (isActive ? tabBarActiveTintColor : tabBarInactiveTintColor) || 'gray';

          return (
            <TouchableOpacity key={key} onPress={() => navigation.navigate(name, params)}>
              <View style={{ alignItems: 'center' }}>
                {tabBarIcon?.({
                  size: 20,
                  focused: isActive,
                  color: color,
                })}
                <Text style={{ color: color }}>{name}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View> */}
    </View>
  );
};
