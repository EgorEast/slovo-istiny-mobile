// Оценка среднего размера проповеди для приблизительного прогресса,
// когда сервер не отдал Content-Length.
export const ESTIMATED_AUDIO_BYTES = 30 * 1024 * 1024

// Держим оценку ниже 100 — финальные 100% шлёт успешное завершение.
export const ESTIMATED_PROGRESS_CAP_PERCENT = 95

/**
 * Приблизительный процент прогресса по уже переданным байтам, когда реальный
 * общий размер неизвестен: доля от предполагаемого объёма, не выше шапки
 * `capPercent` (финальное 100% шлёт успешное завершение операции).
 * @param bytes - Уже переданные/записанные байты.
 * @param estimatedTotalBytes - Предполагаемый общий объём в байтах.
 * @param capPercent - Верхняя граница процента (по умолчанию `ESTIMATED_PROGRESS_CAP_PERCENT`).
 */
export const estimateBytesPercent = (
  bytes: number,
  estimatedTotalBytes: number,
  capPercent: number = ESTIMATED_PROGRESS_CAP_PERCENT,
): number => {
  if (estimatedTotalBytes <= 0 || bytes <= 0) return 0

  return Math.min(Math.floor((bytes / estimatedTotalBytes) * 100), capPercent)
}
