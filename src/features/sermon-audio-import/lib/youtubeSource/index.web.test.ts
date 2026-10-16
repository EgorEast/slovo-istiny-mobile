import { ImportSourceError } from '../sourceErrors'
import { resolveYoutubeAudio } from './index.web'

describe('resolveYoutubeAudio (web stub)', () => {
  test('rejects with an ImportSourceError since InnerTube is unavailable on web', async () => {
    await expect(resolveYoutubeAudio()).rejects.toBeInstanceOf(ImportSourceError)
  })

  test('classifies the stub failure as service-unavailable', async () => {
    await expect(resolveYoutubeAudio()).rejects.toMatchObject({ code: 'service-unavailable' })
  })
})
