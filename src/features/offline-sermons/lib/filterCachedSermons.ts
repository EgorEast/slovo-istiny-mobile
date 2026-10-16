import { audioCacheService } from 'entities/offline-cache'
import { toAudioPlayerData } from 'entities/sermon'
import { mapWithYields } from 'shared/lib/utils/mapWithYields'
import { type OfflineSermonItem } from '../model'
import { type MergedSermonCandidate } from './mergeSermonCandidates'

// Each isCached call runs a synchronous native file-system check; mapping every
// candidate in a single tick stalls the JS thread while the list loads. The
// chunked map yields between batches so the thread (and the tour's rect samples)
// stays responsive.
export const filterCachedSermons = async (
  pairs: MergedSermonCandidate[],
): Promise<OfflineSermonItem[]> => {
  const narrowed = pairs.flatMap(({ playlist, sermon }) => {
    const audio = toAudioPlayerData(sermon)
    return audio ? [{ playlist, sermon: audio }] : []
  })

  const cachedFlags = await mapWithYields(narrowed, ({ sermon }) =>
    audioCacheService.isCached(sermon.audioUrl).catch(() => false),
  )

  return narrowed.filter((_, index) => cachedFlags[index])
}
