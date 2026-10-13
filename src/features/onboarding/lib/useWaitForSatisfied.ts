import { useAtom } from '@reatom/npm-react'
import { useIsSearchActive } from 'features/sermon-search/@x/onboarding'
import { currentAudioAtom, isPlayingAtom } from 'entities/player/@x/onboarding'
import { type OnboardingStep } from './scenarios'

// Whether an interactive step's wait condition currently holds: a sermon must be
// selected, playback must be paused, or the search must be active (a query long
// enough to show grouped results). `undefined` waitFor is always satisfied.
export const useWaitForSatisfied = (waitFor: OnboardingStep['waitFor']) => {
  const [currentAudio] = useAtom(currentAudioAtom)
  const [isPlaying] = useAtom(isPlayingAtom)
  const isSearchActive = useIsSearchActive()

  if (waitFor === undefined) return true
  if (waitFor === 'sermonSelected') return currentAudio !== null
  if (waitFor === 'searchActive') return isSearchActive

  return currentAudio !== null && !isPlaying
}
