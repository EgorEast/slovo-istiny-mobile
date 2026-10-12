import { useAtom } from '@reatom/npm-react'
import { View } from 'react-native'
import { sermonCachingEnabledAtom } from 'entities/offline-cache'
import { COLORS } from 'shared/ui/theme'
import { useDisplayedDownloadProgress } from '../../model/useDisplayedDownloadProgress'
import { type createMiniStyles } from './miniStyles'

export const MiniDownloadProgress = ({
  audioUrl,
  miniStyles,
}: {
  audioUrl: string
  miniStyles: ReturnType<typeof createMiniStyles>
}) => {
  const [isSermonCachingEnabled] = useAtom(sermonCachingEnabledAtom)
  const rawProgress = useDisplayedDownloadProgress(audioUrl)
  // Caching off in settings: the thin strip is a download indicator, so it
  // stays hidden even while a stale download record drains.
  const displayProgress = isSermonCachingEnabled ? rawProgress : 0

  if (displayProgress <= 0) return null

  return (
    <View style={miniStyles.downloadTrack}>
      <View
        style={[
          miniStyles.downloadFill,
          {
            // Shared `COLORS.progressBuffered` keeps the miniplayer strip and
            // the fullscreen buffered layer (`PlayerProgressBar.styles.ts`)
            // identical over their tracks.
            backgroundColor: COLORS.progressBuffered,
            width: `${displayProgress * 100}%`,
          },
        ]}
      />
    </View>
  )
}
