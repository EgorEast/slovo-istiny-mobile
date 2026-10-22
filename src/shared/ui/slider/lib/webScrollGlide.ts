export interface ScrollGlide {
  cancel: () => void
}

interface GlideNode {
  scrollLeft: number
}

interface StartScrollGlideOptions {
  durationMs: number
  from: number
  node: GlideNode
  to: number
}

const GLIDE_MIN_DURATION_MS = 140

const GLIDE_DURATION_PER_PX_MS = 0.35

const GLIDE_MAX_DURATION_MS = 600

const GLIDE_EPSILON_PX = 0.5

export const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3

// Дистанция довода переводится в длительность: короткий довод не «щёлкает»,
// длинный не растягивается дольше одного плавного жеста.
export const getGlideDurationMs = (distancePx: number): number =>
  Math.min(
    GLIDE_MAX_DURATION_MS,
    Math.max(
      GLIDE_MIN_DURATION_MS,
      GLIDE_MIN_DURATION_MS + GLIDE_DURATION_PER_PX_MS * Math.abs(distancePx),
    ),
  )

/**
 * Glides `node.scrollLeft` to `to` on rAF with an easeOutCubic curve.
 * @param options - Start/target offsets, node and duration.
 * @param options.durationMs - Glide length in milliseconds.
 * @param options.from - Starting scrollLeft offset.
 * @param options.node - Scrollable node to animate.
 * @param options.to - Target scrollLeft offset.
 * @returns Handle whose `cancel` stops the loop.
 */
export const startScrollGlide = ({
  durationMs,
  from,
  node,
  to,
}: StartScrollGlideOptions): ScrollGlide => {
  let frame = 0
  let cancelled = false
  let startedAt: null | number = null

  const finish = () => {
    node.scrollLeft = to
  }

  if (durationMs <= 0 || Math.abs(to - from) < GLIDE_EPSILON_PX) {
    finish()
    return { cancel: () => {} }
  }

  const step = (timestamp: number) => {
    if (cancelled) return
    startedAt ??= timestamp
    const progress = Math.min((timestamp - startedAt) / durationMs, 1)
    node.scrollLeft = from + (to - from) * easeOutCubic(progress)
    if (progress >= 1) {
      finish()
      return
    }
    frame = requestAnimationFrame(step)
  }

  frame = requestAnimationFrame(step)

  return {
    cancel: () => {
      cancelled = true
      cancelAnimationFrame(frame)
    },
  }
}
