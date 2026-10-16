const RETRY_INTERVAL_MS = 200
const MAX_RETRY_ATTEMPTS = 10

/**
 * Applies a callback as soon as the player reports loaded, polling while it is
 * still not. Each schedule bumps a version counter so a newer request — or an
 * explicit invalidate() from clear() — cancels a stale poll that is still ticking.
 */
class LoadedRetryScheduler {
  public schedule = (isLoaded: () => boolean, apply: () => void): void => {
    this.version++
    const version = this.version

    if (isLoaded()) {
      apply()
      return
    }

    let attempts = 0
    const interval = setInterval(() => {
      attempts++

      if (this.version !== version) {
        clearInterval(interval)
        return
      }

      if (isLoaded()) {
        clearInterval(interval)
        apply()
      } else if (attempts >= MAX_RETRY_ATTEMPTS) clearInterval(interval)
    }, RETRY_INTERVAL_MS)
  }

  public invalidate = (): void => {
    this.version++
  }

  private version = 0
}

export const loadedRetryScheduler = new LoadedRetryScheduler()
