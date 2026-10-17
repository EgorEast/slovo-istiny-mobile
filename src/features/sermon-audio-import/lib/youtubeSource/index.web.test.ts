import { ImportSourceError } from '../sourceErrors'
import { resolveYoutubeAudio } from './index.web'

const VIDEO_ID = 'dQw4w9WgXcQ'

describe('resolveYoutubeAudio (web stub)', () => {
  test('rejects with an ImportSourceError since InnerTube is unavailable on web', async () => {
    await expect(resolveYoutubeAudio(VIDEO_ID)).rejects.toBeInstanceOf(ImportSourceError)
  })

  test('classifies the stub failure as service-unavailable', async () => {
    await expect(resolveYoutubeAudio(VIDEO_ID)).rejects.toMatchObject({
      code: 'service-unavailable',
    })
  })

  test('mentions the videoId in the cause message for debuggability', async () => {
    await expect(resolveYoutubeAudio(VIDEO_ID)).rejects.toMatchObject({
      rootCause: { message: expect.stringContaining(VIDEO_ID) },
    })
  })
})
