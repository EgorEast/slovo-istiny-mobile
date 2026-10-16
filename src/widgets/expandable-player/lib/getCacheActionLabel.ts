import { type TrackCacheVisualState } from 'entities/offline-cache'

const ADD_TO_OFFLINE_TEXT = 'Добавить в офлайн'
const REMOVE_CACHE_TEXT = 'Удалить из офлайн'
const STOP_CACHING_TEXT = 'Остановить добавление в офлайн'
const REMOVE_FROM_QUEUE_TEXT = 'Убрать из очереди'

const OFFLINE_ACTION_LABELS: Record<TrackCacheVisualState, string> = {
  cached: REMOVE_CACHE_TEXT,
  cloud: ADD_TO_OFFLINE_TEXT,
  downloading: STOP_CACHING_TEXT,
  playing: ADD_TO_OFFLINE_TEXT,
  queued: REMOVE_FROM_QUEUE_TEXT,
}

// The offline row's label depends on the cache state; a playing track still shows the
// cached/uncached action, so it is resolved from `isCached` instead of the state map.
export const getCacheActionLabel = (
  visualState: TrackCacheVisualState,
  isCached: boolean,
): string => {
  if (visualState === 'playing') return isCached ? REMOVE_CACHE_TEXT : ADD_TO_OFFLINE_TEXT
  return OFFLINE_ACTION_LABELS[visualState]
}
