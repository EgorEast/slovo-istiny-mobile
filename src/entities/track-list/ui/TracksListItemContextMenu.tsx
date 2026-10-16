import { type ReactElement } from 'react'
import { type AnchorRect, MenuDropdown, type MenuItem } from 'shared/ui/menu'
import { type TrackCacheVisualState } from './trackCacheState'
import { type MenuActionItem } from './types'

export interface TracksListItemContextMenuProps {
  anchor: AnchorRect | null
  /**
   * Onboarding target ids for the cache action row, keyed by toggle direction: the
   * `add` id wraps it while the row is not cached, `remove` while it is.
   */
  cacheActionOnboardingTargetIds?: { add: string; remove: string }
  isCached: boolean
  isCacheDisabled?: boolean
  isMenuOpen: boolean
  /** Global sermon-caching setting; when off, the cache action is omitted. */
  isSermonCachingEnabled: boolean
  menuActions?: MenuItem[]
  onClose: () => void
  onToggleCache: () => void
  /** Wraps each rendered dropdown row (e.g. In an onboarding target). */
  renderMenuItem?: (row: ReactElement, item: MenuActionItem) => ReactElement
  visualState: TrackCacheVisualState
}

interface CacheActionItem {
  icon?: Extract<MenuItem, { iconFamily?: 'ionicons' }>['icon']
  text: string
}

const CACHE_ACTION_ITEMS: Record<Exclude<TrackCacheVisualState, 'playing'>, CacheActionItem> = {
  cached: { icon: 'cloud-offline-outline', text: 'Удалить из офлайн' },
  cloud: { icon: 'cloud-download', text: 'Добавить в офлайн' },
  downloading: { text: 'Остановить добавление в офлайн' },
  queued: { text: 'Убрать из очереди' },
}

const getCacheActionItem = (
  visualState: TrackCacheVisualState,
  isCached: boolean,
): CacheActionItem => {
  // The resolver collapses a playing track to 'playing' regardless of cache
  // status; the menu still needs the cached detail to pick add vs remove.
  if (visualState === 'playing')
    return isCached ? CACHE_ACTION_ITEMS.cached : CACHE_ACTION_ITEMS.cloud

  return CACHE_ACTION_ITEMS[visualState]
}

export const TracksListItemContextMenu = ({
  anchor,
  cacheActionOnboardingTargetIds,
  isCached,
  isCacheDisabled = false,
  isMenuOpen,
  isSermonCachingEnabled,
  menuActions,
  onClose,
  onToggleCache,
  renderMenuItem,
  visualState,
}: TracksListItemContextMenuProps) => {
  const cacheAction = getCacheActionItem(visualState, isCached)
  const cacheActionTargetId =
    cacheActionOnboardingTargetIds === undefined
      ? undefined
      : isCached
        ? cacheActionOnboardingTargetIds.remove
        : cacheActionOnboardingTargetIds.add
  // Caching off in settings: the cache action is meaningless, so the row menu
  // keeps only its non-cache items.
  const items: MenuActionItem[] = [
    ...(isSermonCachingEnabled
      ? [
          {
            disabled: isCacheDisabled,
            icon: cacheAction.icon,
            onboardingTargetId: cacheActionTargetId,
            onPress: onToggleCache,
            text: cacheAction.text,
          },
        ]
      : []),
    ...(menuActions ?? []),
  ]

  return (
    <MenuDropdown
      items={items}
      anchor={anchor}
      onClose={onClose}
      visible={isMenuOpen}
      renderItem={renderMenuItem}
    />
  )
}
