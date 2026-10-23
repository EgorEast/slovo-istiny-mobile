/**
 * Веб-фолбэк без доступа к папке: экспорт скачивает файл, импорт открывает
 * системный выбор файла. Используется, когда File System Access API недоступен
 * (Firefox/Safari) или папка не выбрана.
 */

import { BACKUP_FILE_TOO_LARGE_MESSAGE, MAX_BACKUP_FILE_BYTES } from './backupSizeLimit'

/**
 * Скачивает JSON как файл через временную `<a download>`.
 * @param name - Имя сохраняемого файла.
 * @param json - Содержимое файла.
 */
export const downloadBackupFile = (name: string, json: string): void => {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = name
  anchor.rel = 'noopener'
  anchor.click()
  URL.revokeObjectURL(url)
}

/**
 * Открывает системный выбор файла и читает его текстом.
 * @returns Содержимое файла или `null`, если выбор отменён/не удался.
 * @throws Ошибка, если выбранный файл превышает `MAX_BACKUP_FILE_BYTES`.
 */
export const pickBackupFileText = (): Promise<null | string> =>
  new Promise((resolve, reject) => {
    const input = document.createElement('input')

    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }

      if (file.size > MAX_BACKUP_FILE_BYTES) {
        reject(new Error(BACKUP_FILE_TOO_LARGE_MESSAGE))
        return
      }

      void file
        .text()
        .then(resolve)
        .catch(() => resolve(null))
    }
    // Отмена диалога: без этого промис никогда не резолвится и импорт «зависает».
    input.oncancel = () => resolve(null)
    input.click()
  })
