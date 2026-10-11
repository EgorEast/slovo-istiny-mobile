import { useAtom } from '@reatom/npm-react'
import { View } from 'react-native'
import { sermonCachingEnabledAtom } from 'entities/offline-cache'
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
            // Same rgba as the fullscreen buffered layer
            // (`PlayerProgressBar.styles.ts` → `downloadProgress`) so both
            // players show the buffered volume identically over the track.
            backgroundColor: 'rgba(255,255,255,0.35)',
            width: `${displayProgress * 100}%`,
          },
        ]}
      />
    </View>
  )
}
