import type { Subscription } from 'expo-modules-core';
import { EventEmitter, NativeModulesProxy } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to PlayerInNotificationBar.web.ts
// and on native platforms to PlayerInNotificationBar.ts
import {
  ChangeEventPayload,
  PlayerInNotificationBarViewProps,
} from '@modules/player-in-notification-bar/src/PlayerInNotificationBar.types';
import PlayerInNotificationBarModule from '@modules/player-in-notification-bar/src/PlayerInNotificationBarModule';
import PlayerInNotificationBarView from '@modules/player-in-notification-bar/src/PlayerInNotificationBarView';

// Get the native constant value.
export const PI = PlayerInNotificationBarModule.PI;

export function hello(): string {
  return PlayerInNotificationBarModule.hello();
}

export async function setValueAsync(value: string) {
  return await PlayerInNotificationBarModule.setValueAsync(value);
}

const emitter = new EventEmitter(
  PlayerInNotificationBarModule ?? NativeModulesProxy.PlayerInNotificationBar,
);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { ChangeEventPayload, PlayerInNotificationBarView, PlayerInNotificationBarViewProps };
