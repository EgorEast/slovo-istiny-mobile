import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import type { PlayerInNotificationBarViewProps } from './PlayerInNotificationBar.types';

const NativeView: React.ComponentType<PlayerInNotificationBarViewProps> =
  requireNativeViewManager('PlayerInNotificationBar');

export default function PlayerInNotificationBarView(props: PlayerInNotificationBarViewProps) {
  return <NativeView {...props} />;
}
