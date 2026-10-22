const FLING_PROJECTION_MS = 300

const MIN_VELOCITY_SPAN_MS = 1

export interface ScrollSample {
  scrollLeft: number
  time: number
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export const findNearestOffset = (position: number, offsets: number[]): null | number => {
  let nearest: null | number = null
  for (const offset of offsets)
    if (nearest === null || Math.abs(offset - position) < Math.abs(nearest - position))
      nearest = offset

  return nearest
}

// Скорость пальца по краям окна сэмплов (px/ms); вырожденное окно — покой.
export const computeFlingVelocity = (samples: ScrollSample[]): number => {
  const first = samples[0]
  const last = samples[samples.length - 1]
  if (!first || !last || samples.length < 2) return 0
  const span = last.time - first.time
  if (span < MIN_VELOCITY_SPAN_MS) return 0
  return (last.scrollLeft - first.scrollLeft) / span
}

interface ProjectFlingTargetOptions {
  maxTravelPx: number
  offsets: number[]
  scrollLeft: number
  velocity: number
}

// Проекция скорости ограничена maxTravelPx (аналог decelerationRate='fast'):
// флинг не улетает далеко, а ближайший снап к проекции становится целью.
export const projectFlingTarget = ({
  maxTravelPx,
  offsets,
  scrollLeft,
  velocity,
}: ProjectFlingTargetOptions): number => {
  const projected = scrollLeft + velocity * FLING_PROJECTION_MS
  const bounded = scrollLeft + clamp(projected - scrollLeft, -maxTravelPx, maxTravelPx)
  return findNearestOffset(bounded, offsets) ?? scrollLeft
}
