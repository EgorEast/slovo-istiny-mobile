import { type ResolvedAudio } from '../importTypes'
import { ImportSourceError } from '../sourceErrors'

// InnerTube недоступен на web (шимы и eval браузер не поддерживает), а youtubei.js
// не должен попадать в web-бандл; resolveAudio уводит импорт в Invidious до этого
// вызова (importAudio.ts) — заглушка страхует граф бандла.
export const resolveYoutubeAudio = async (): Promise<ResolvedAudio> => {
  throw new ImportSourceError(
    'service-unavailable',
    new Error('YouTube (InnerTube) is not supported on web'),
  )
}
