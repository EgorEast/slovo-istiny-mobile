import {
  estimateBytesPercent,
  ESTIMATED_AUDIO_BYTES,
} from 'shared/lib/progress/estimateBytesProgress'

export const PROGRESS_TICK_MIN_INTERVAL_MS = 250

/**
 * Троттлит сырые тики прогресса скачивания. При известном `totalBytes` эмитит
 * дробь 0..1 только на дельту ≥ 1% и не чаще раза в
 * `PROGRESS_TICK_MIN_INTERVAL_MS` (финальный 1 — всегда). При chunked-ответе
 * без `Content-Length` — монотонную приблизительную оценку по записанным байтам
 * (шапка 95%, финальные 100% шлёт успешное завершение в `downloadToCache`).
 * @param onProgress - Колбэк прогресса (0..1).
 */
export const createThrottledProgress = (onProgress: (progress: number) => void) => {
  let last = 0
  let lastEmittedAt = 0
  let lastEstimatedPercent = 0
  return (data: { bytesWritten: number; totalBytes: number }) => {
    if (data.totalBytes <= 0) {
      const percent = estimateBytesPercent(data.bytesWritten, ESTIMATED_AUDIO_BYTES)
      if (percent <= lastEstimatedPercent) return
      lastEstimatedPercent = percent
      onProgress(percent / 100)
      return
    }

    const fraction = Math.max(0, Math.min(1, data.bytesWritten / data.totalBytes))
    const now = Date.now()
    const elapsed = now - lastEmittedAt
    if ((fraction - last >= 0.01 && elapsed >= PROGRESS_TICK_MIN_INTERVAL_MS) || fraction === 1) {
      last = fraction
      lastEmittedAt = now
      onProgress(fraction)
    }
  }
}
