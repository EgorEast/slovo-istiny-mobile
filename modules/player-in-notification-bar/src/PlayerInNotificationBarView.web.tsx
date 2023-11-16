import * as React from 'react';

import type { PlayerInNotificationBarViewProps } from './PlayerInNotificationBar.types';

export default function PlayerInNotificationBarView(props: PlayerInNotificationBarViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
