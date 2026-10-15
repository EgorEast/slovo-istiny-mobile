import { type ReactElement } from 'react'
import { type StyleProp, type ViewStyle } from 'react-native'
import { type MenuItem } from 'shared/ui/menu'
import { type TrackCacheState } from './trackCacheState'

// A row-menu action that may carry the onboarding target id its dropdown row is
// wrapped with — plain data, so the entity never imports features/onboarding.
export type MenuActionItem = { onboardingTargetId?: string } & MenuItem

// The dropdown's open/close controls handed to the owner, so a tour can drive the
// live menu without the entity knowing about onboarding.
export interface TrackListMenuControls {
  close: () => void
  open: () => void
}

export interface TracksListItemProps {
  artwork?: null | string
  audioUrl?: string
  /** Hands the row's dropdown open/close controls to the owner (stable callback). */
  bindMenuOpener?: (controls: TrackListMenuControls) => void
  /**
   * Onboarding target ids for the built-in cache action row, keyed by toggle
   * direction: `add` while the row is not cached, `remove` while it is. Plain data,
   * so the entity never imports features/onboarding.
   */
  cacheActionOnboardingTargetIds?: { add: string; remove: string }
  /** Кэш-состояние строки, посчитанное вызывающим слоем через entities/offline-cache. */
  cacheState: TrackCacheState
  isAudioPlaying?: boolean
  isPlaying: boolean
  /** Custom context-menu actions. Added after the default cache toggle. */
  menuActions?: MenuActionItem[]
  onPress: () => void
  /** Listening progress 0..1, renders a thin bar along the row bottom edge. A value of 1 dims the row (listened). */
  progress?: number
  /**
   * Wraps the row's ⋯ menu trigger (e.g. In an onboarding target); falls back to the
   * bare trigger. Generic, so the entity never imports features/onboarding.
   */
  renderMenuButton?: (button: ReactElement) => ReactElement
  /** Wraps each rendered dropdown row (e.g. In an onboarding target); falls back to the bare row. */
  renderMenuItem?: (row: ReactElement, item: MenuActionItem) => ReactElement
  style?: StyleProp<ViewStyle>
  subtitle?: string
  title: string
}
