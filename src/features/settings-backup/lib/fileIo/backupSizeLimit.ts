/** Максимальный размер файла резервной копии, принимаемого при импорте (10 МБ). */
export const MAX_BACKUP_FILE_BYTES = 10 * 1024 * 1024

/** Сообщение о превышении размера — импорт показывает его тостом. */
export const BACKUP_FILE_TOO_LARGE_MESSAGE = 'Файл резервной копии слишком большой (максимум 10 МБ)'

/**
 * Проверяет размер файла до чтения содержимого: превышение лимита бросает
 * ошибку с понятным пользователю текстом. Неизвестный размер
 * (`null`/`undefined`) лимит не нарушает — такой файл читается как раньше.
 * @param bytes - Размер файла в байтах или `null`/`undefined`, если он неизвестен.
 */
export const assertBackupFileSize = (bytes: null | number | undefined): void => {
  if (bytes != null && bytes > MAX_BACKUP_FILE_BYTES) throw new Error(BACKUP_FILE_TOO_LARGE_MESSAGE)
}
