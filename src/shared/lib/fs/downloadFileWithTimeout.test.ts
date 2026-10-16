import { type File } from 'expo-file-system'
import {
  DOWNLOAD_STALL_TIMEOUT_MS,
  DOWNLOAD_TIMEOUT_MS,
  downloadFileWithTimeout,
} from './downloadFileWithTimeout'

const mockCreateDownloadTask = jest.fn((..._args: unknown[]) => ({
  downloadAsync: jest.fn(),
})) as jest.Mock
const mockDeleteFile = jest.fn()
const mockFile = { exists: true }

jest.mock('expo-file-system', () => ({
  File: class MockFile {
    public static createDownloadTask(...args: unknown[]) {
      return (mockCreateDownloadTask as jest.Mock)(...args)
    }

    public delete = mockDeleteFile
    public exists = mockFile.exists
  },
}))

const SOURCE_URL = 'https://source.test/audio.m4a'
const TIMEOUT_MS = 5000
const STALL_MS = 30_000
const LONG_TIMEOUT_MS = 600_000
const DESTINATION = {} as File
// Настоящий `File` умеет удалять себя; пустой объект `DESTINATION` не проходит
// проверку `file.exists` в `deleteFileBestEffort`, поэтому для проверки удаления
// частичного файла нужен носитель с `exists`/`delete`.
const DELETABLE_DESTINATION = { delete: mockDeleteFile, exists: true } as unknown as File

const mockPendingDownload = () => {
  mockCreateDownloadTask.mockReturnValue({
    downloadAsync: jest.fn().mockReturnValue(new Promise(() => {})),
  })
}

interface DownloadOptions {
  onProgress?: (progress: { bytesWritten: number; totalBytes: number }) => void
  signal: AbortSignal
}

// Задача скачивания под ручным управлением: тест сам эмитит сырые тики прогресса
// и завершает `downloadAsync`, чтобы проверить перезарядку stall-таймера.
const mockStallableDownload = () => {
  let options: DownloadOptions | undefined
  let settle: (file: File) => void = () => undefined

  mockCreateDownloadTask.mockImplementation((...args: unknown[]) => {
    options = args[2] as DownloadOptions

    return {
      downloadAsync: () =>
        new Promise<File>(resolve => {
          settle = resolve
        }),
    }
  })

  return {
    emitProgress: (progress: { bytesWritten: number; totalBytes: number }) =>
      options?.onProgress?.(progress),
    resolve: () => settle(DESTINATION),
  }
}

describe('downloadFileWithTimeout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('rejects an already aborted signal without starting a download', async () => {
    mockPendingDownload()
    const controller = new AbortController()
    controller.abort()

    await expect(
      downloadFileWithTimeout(SOURCE_URL, DESTINATION, undefined, TIMEOUT_MS, controller.signal),
    ).rejects.toThrow(`Download timed out after ${TIMEOUT_MS / 1000}s`)
    expect(mockCreateDownloadTask).not.toHaveBeenCalled()
  })

  test('leaves no partial file behind for an already aborted signal', async () => {
    mockPendingDownload()
    const controller = new AbortController()
    controller.abort()

    await expect(
      downloadFileWithTimeout(SOURCE_URL, DESTINATION, undefined, TIMEOUT_MS, controller.signal),
    ).rejects.toBeDefined()
    expect(mockDeleteFile).not.toHaveBeenCalled()
  })

  test('rejects when the signal aborts while downloading', async () => {
    mockPendingDownload()
    const controller = new AbortController()

    const pending = downloadFileWithTimeout(
      SOURCE_URL,
      DESTINATION,
      undefined,
      TIMEOUT_MS,
      controller.signal,
    )
    controller.abort()

    await expect(pending).rejects.toThrow(`Download timed out after ${TIMEOUT_MS / 1000}s`)
    expect(mockCreateDownloadTask).toHaveBeenCalledTimes(1)
  })

  test('resolves with the file on success and reports progress', async () => {
    mockCreateDownloadTask.mockImplementation(
      (
        _url: unknown,
        _destination: unknown,
        options: { onProgress: (p: { bytesWritten: number; totalBytes: number }) => void },
      ) => {
        options.onProgress({ bytesWritten: 30, totalBytes: 120 })
        options.onProgress({ bytesWritten: 10, totalBytes: 0 })
        return { downloadAsync: jest.fn().mockResolvedValue(DESTINATION) }
      },
    )

    const progress: number[] = []

    await expect(
      downloadFileWithTimeout(
        SOURCE_URL,
        DESTINATION,
        percent => progress.push(percent),
        TIMEOUT_MS,
      ),
    ).resolves.toBe(DESTINATION)
    expect(progress).toEqual([25])
  })

  test('keeps the default budgets exported for callers', () => {
    expect(DOWNLOAD_TIMEOUT_MS).toBe(600_000)
    expect(DOWNLOAD_STALL_TIMEOUT_MS).toBe(30_000)
  })

  describe('stall guard', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test('rejects and deletes the partial file when no progress arrives within the stall window', async () => {
      mockStallableDownload()

      const pending = downloadFileWithTimeout(
        SOURCE_URL,
        DELETABLE_DESTINATION,
        undefined,
        LONG_TIMEOUT_MS,
        undefined,
        STALL_MS,
      )
      const assertion = expect(pending).rejects.toThrow(
        `Download stalled: no progress for ${STALL_MS / 1000}s`,
      )

      await jest.advanceTimersByTimeAsync(STALL_MS)
      await assertion
      expect(mockDeleteFile).toHaveBeenCalledTimes(1)
    })

    test('a raw progress tick re-arms the stall window and forwards the percent', async () => {
      const download = mockStallableDownload()
      const progress: number[] = []

      const pending = downloadFileWithTimeout(
        SOURCE_URL,
        DESTINATION,
        percent => progress.push(percent),
        LONG_TIMEOUT_MS,
        undefined,
        STALL_MS,
      )

      await jest.advanceTimersByTimeAsync(STALL_MS - 1000)
      download.emitProgress({ bytesWritten: 10, totalBytes: 100 })
      await jest.advanceTimersByTimeAsync(STALL_MS - 1000)
      download.emitProgress({ bytesWritten: 20, totalBytes: 100 })
      await jest.advanceTimersByTimeAsync(STALL_MS - 1000)
      download.resolve()

      await expect(pending).resolves.toBe(DESTINATION)
      expect(progress).toEqual([10, 20])
      expect(mockDeleteFile).not.toHaveBeenCalled()
    })

    test('resets the stall timer even when the caller passes no onProgress', async () => {
      const download = mockStallableDownload()

      const pending = downloadFileWithTimeout(
        SOURCE_URL,
        DESTINATION,
        undefined,
        LONG_TIMEOUT_MS,
        undefined,
        STALL_MS,
      )

      await jest.advanceTimersByTimeAsync(STALL_MS - 1000)
      download.emitProgress({ bytesWritten: 10, totalBytes: 100 })
      await jest.advanceTimersByTimeAsync(STALL_MS - 1000)
      download.emitProgress({ bytesWritten: 20, totalBytes: 100 })
      await jest.advanceTimersByTimeAsync(STALL_MS - 1000)
      download.resolve()

      await expect(pending).resolves.toBe(DESTINATION)
    })

    test('a tick without a known total still resets the timer without reporting a percent', async () => {
      const download = mockStallableDownload()
      const progress: number[] = []

      const pending = downloadFileWithTimeout(
        SOURCE_URL,
        DESTINATION,
        percent => progress.push(percent),
        LONG_TIMEOUT_MS,
        undefined,
        STALL_MS,
      )

      await jest.advanceTimersByTimeAsync(STALL_MS - 1000)
      download.emitProgress({ bytesWritten: 500, totalBytes: 0 })
      await jest.advanceTimersByTimeAsync(STALL_MS - 1000)
      download.emitProgress({ bytesWritten: 700, totalBytes: 0 })
      await jest.advanceTimersByTimeAsync(STALL_MS - 1000)
      download.resolve()

      await expect(pending).resolves.toBe(DESTINATION)
      expect(progress).toEqual([])
    })

    test('still applies the absolute budget when it is shorter than the stall window', async () => {
      mockStallableDownload()

      const pending = downloadFileWithTimeout(
        SOURCE_URL,
        DESTINATION,
        undefined,
        TIMEOUT_MS,
        undefined,
        STALL_MS,
      )
      const assertion = expect(pending).rejects.toThrow(
        `Download timed out after ${TIMEOUT_MS / 1000}s`,
      )

      await jest.advanceTimersByTimeAsync(TIMEOUT_MS)
      await assertion
    })
  })
})
