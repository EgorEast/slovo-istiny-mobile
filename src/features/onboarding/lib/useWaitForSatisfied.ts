import { useAtom } from '@reatom/npm-react'
import { offlineSermonsLoadedAtom } from 'entities/offline-cache/@x/onboarding'
import { currentAudioAtom, isPlayingAtom } from 'entities/player/@x/onboarding'
import { type OnboardingStep } from './scenarios'

// Whether an interactive step's wait condition currently holds: a sermon must be
// selected, playback must be paused, or the offline cached list must have loaded.
// `undefined` waitFor is always satisfied.
export const useWaitForSatisfied = (waitFor: OnboardingStep['waitFor']) => {
  const [currentAudio] = useAtom(currentAudioAtom)
  const [isPlaying] = useAtom(isPlayingAtom)
  const [isOfflineLoaded] = useAtom(offlineSermonsLoadedAtom)

  if (waitFor === undefined) return true
  if (waitFor === 'sermonSelected') return currentAudio !== null
  if (waitFor === 'offlineLoaded') return isOfflineLoaded

  return currentAudio !== null && !isPlaying
}
