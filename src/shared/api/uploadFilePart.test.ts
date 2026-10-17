import { type AxiosProgressEvent } from 'axios'
import {
  ESTIMATED_AUDIO_BYTES,
  ESTIMATED_PROGRESS_CAP_PERCENT,
} from '../lib/progress/estimateBytesProgress'
import { filesApi } from './generated'
import {
  reportProgress,
  reportUploadComplete,
  uploadFilePart,
  type UploadOptions,
} from './uploadFilePart'

const mockUploadPart = jest.fn()

jest.mock('./generated', () => ({ filesApi: { getFiles: jest.fn() } }))

const mockedGetFiles = filesApi.getFiles as jest.Mock

const createProgressEvent = (loaded: number, total?: number): AxiosProgressEvent => ({
  bytes: loaded,
  lengthComputable: total !== undefined && total > 0,
  loaded,
  total,
})

const FILE_NAME = 'sermon.mp3'
const FILE_URL = 'https://cdn.test/sermon.mp3'

describe('reportProgress', () => {
  test('reports the real percent when total is known', () => {
    const onProgress = jest.fn()

    reportProgress({ onProgress }, createProgressEvent(50, 200))

    expect(onProgress).toHaveBeenCalledWith(25)
  })

  test('estimates a monotonic capped percent when total is unknown', () => {
    const onProgress = jest.fn()
    const options: UploadOptions = { onProgress }

    reportProgress(options, createProgressEvent(ESTIMATED_AUDIO_BYTES / 2, 0))
    reportProgress(options, createProgressEvent(ESTIMATED_AUDIO_BYTES, 0))
    // Goes backwards: must be ignored (monotonic guard).
    reportProgress(options, createProgressEvent(ESTIMATED_AUDIO_BYTES / 4, 0))

    expect(onProgress.mock.calls.map(([percent]) => percent)).toEqual([
      50,
      ESTIMATED_PROGRESS_CAP_PERCENT,
    ])
    expect(onProgress).not.toHaveBeenCalledWith(100)
  })

  test('uses the real file size as the estimate when provided', () => {
    const onProgress = jest.fn()

    reportProgress({ onProgress, totalBytes: 1000 }, createProgressEvent(500, 0))

    expect(onProgress).toHaveBeenCalledWith(50)
  })

  test('does nothing without an onProgress callback', () => {
    expect(() => reportProgress({}, createProgressEvent(500, 0))).not.toThrow()
  })
})

describe('reportUploadComplete', () => {
  test('emits 100 once after an estimated upload', () => {
    const onProgress = jest.fn()
    const options: UploadOptions = { onProgress }
    reportProgress(options, createProgressEvent(ESTIMATED_AUDIO_BYTES, 0))

    reportUploadComplete(options)
    reportUploadComplete(options)

    expect(onProgress).toHaveBeenLastCalledWith(100)
    expect(onProgress.mock.calls.filter(([percent]) => percent === 100)).toHaveLength(1)
  })

  test('does not emit 100 when the total was known', () => {
    const onProgress = jest.fn()
    const options: UploadOptions = { onProgress }
    reportProgress(options, createProgressEvent(100, 100))
    onProgress.mockClear()

    reportUploadComplete(options)

    expect(onProgress).not.toHaveBeenCalled()
  })
})

describe('uploadFilePart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetFiles.mockReturnValue({ appControllerUploadFile: mockUploadPart })
    mockUploadPart.mockResolvedValue({ fileName: FILE_NAME, fileUrl: FILE_URL })
  })

  test('emits estimated ticks and a final 100 when the server omits the total', async () => {
    const file = new Blob(['x'.repeat(1000)])
    mockUploadPart.mockImplementation(
      (_params: unknown, config: { onUploadProgress: (event: AxiosProgressEvent) => void }) => {
        config.onUploadProgress(createProgressEvent(500))
        config.onUploadProgress(createProgressEvent(1000))
        return Promise.resolve({ fileName: FILE_NAME, fileUrl: FILE_URL })
      },
    )
    const onProgress = jest.fn()

    const result = await uploadFilePart(file, { onProgress })

    expect(onProgress).toHaveBeenCalledWith(50)
    expect(onProgress).toHaveBeenLastCalledWith(100)
    expect(result).toEqual({ fileName: FILE_NAME, fileUrl: FILE_URL })
  })

  test('does not emit 100 on a failed upload and leaves the next call unpoisoned', async () => {
    const file = new Blob(['x'.repeat(1000)])
    mockUploadPart
      .mockImplementationOnce(
        (_params: unknown, config: { onUploadProgress: (event: AxiosProgressEvent) => void }) => {
          config.onUploadProgress(createProgressEvent(500))
          return Promise.reject(new Error('upload failed'))
        },
      )
      .mockImplementationOnce(
        (_params: unknown, config: { onUploadProgress: (event: AxiosProgressEvent) => void }) => {
          config.onUploadProgress(createProgressEvent(500))
          config.onUploadProgress(createProgressEvent(1000))
          return Promise.resolve({ fileName: FILE_NAME, fileUrl: FILE_URL })
        },
      )
    const onProgress = jest.fn()
    const options: UploadOptions = { onProgress }

    await expect(uploadFilePart(file, options)).rejects.toThrow('upload failed')

    expect(onProgress).not.toHaveBeenCalledWith(100)

    onProgress.mockClear()
    const result = await uploadFilePart(file, options)

    // The same options object reports normally again: the failed upload left no
    // stale percent in the WeakMap keyed by the options object.
    expect(onProgress).toHaveBeenCalledWith(50)
    expect(onProgress).toHaveBeenLastCalledWith(100)
    expect(result).toEqual({ fileName: FILE_NAME, fileUrl: FILE_URL })
  })
})
