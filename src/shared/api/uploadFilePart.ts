import { type AxiosProgressEvent } from 'axios'
import { getErrorMessage } from '../lib/error-utils'
import { estimateBytesPercent, ESTIMATED_AUDIO_BYTES } from '../lib/progress/estimateBytesProgress'
import { filesApi } from './generated'

export interface UploadedFile {
  fileName: string
  fileUrl: string
}

export interface UploadOptions {
  /** Вызывается с процентом загрузки 0–100. */
  onProgress?: (percent: number) => void
  /** Реальный размер файла в байтах — уточняет оценку при chunked-загрузке. */
  totalBytes?: number
}

const PROGRESS_MAX = 100

const lastEmittedPercent = new WeakMap<UploadOptions, number>()
const estimatedUploads = new WeakSet<UploadOptions>()

/**
 * Переводит событие прогресса axios в процент загрузки. Когда сервер не отдал
 * общий размер (`event.total` = 0/undefined) — приблизительная монотонная
 * оценка по `event.loaded` и известному/предполагаемому размеру файла.
 * @param options - Необязательный колбэк прогресса загрузки.
 * @param event - Событие прогресса запроса axios.
 */
export const reportProgress = (options: UploadOptions, event: AxiosProgressEvent): void => {
  const { onProgress } = options
  if (!onProgress) return

  const total = event.total ?? 0
  if (total > 0) {
    onProgress(Math.round((event.loaded / total) * PROGRESS_MAX))
    return
  }

  estimatedUploads.add(options)
  const estimatedTotal = options.totalBytes ?? ESTIMATED_AUDIO_BYTES
  const percent = estimateBytesPercent(event.loaded, estimatedTotal)
  const previous = lastEmittedPercent.get(options) ?? 0
  if (percent <= previous) return
  lastEmittedPercent.set(options, percent)
  onProgress(percent)
}

/**
 * Шлёт финальные 100% после успешной загрузки, если прогресс шёл по оценке
 * (при известном `total` финальный тик приходит сам).
 * @param options - Тот же объект опций, что и в `reportProgress`.
 */
export const reportUploadComplete = (options: UploadOptions): void => {
  const { onProgress } = options
  if (!onProgress || !estimatedUploads.has(options)) return
  if (lastEmittedPercent.get(options) === PROGRESS_MAX) return
  lastEmittedPercent.set(options, PROGRESS_MAX)
  onProgress(PROGRESS_MAX)
}

/**
 * Общий путь загрузки части файла на сервер (`POST /files`, multipart): generated
 * функция строит FormData сама, а ошибки нормализуются в сообщение.
 * @param file - Blob/File для multipart-части.
 * @param options - Необязательный колбэк прогресса загрузки.
 */
export const uploadFilePart = async (
  file: Blob | File,
  options: UploadOptions,
): Promise<UploadedFile> => {
  const uploadOptions: UploadOptions = { ...options, totalBytes: file.size }
  try {
    const response = await filesApi.getFiles().appControllerUploadFile(
      { file },
      {
        onUploadProgress: event => reportProgress(uploadOptions, event),
        // Большие аудиофайлы загружаются минутами: снимаем любой унаследованный
        // таймаут запроса, чтобы axios не оборвал передачу на середине.
        timeout: 0,
      },
    )
    reportUploadComplete(uploadOptions)

    return { fileName: response.fileName, fileUrl: response.fileUrl }
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error })
  }
}
