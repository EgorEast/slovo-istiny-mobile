import { useAtom } from '@reatom/npm-react'
import { currentAudioAtom, isPlayingAtom } from 'entities/player/@x/onboarding'
import { type OnboardingStep } from './scenarios'

// Whether an interactive step's wait condition currently holds: a sermon must be
// selected, or playback must be paused. `undefined` waitFor is always satisfied.
export const useWaitForSatisfied = (waitFor: OnboardingStep['waitFor']) => {
  const [currentAudio] = useAtom(currentAudioAtom)
  const [isPlaying] = useAtom(isPlayingAtom)

  if (waitFor === undefined) return true
  if (waitFor === 'sermonSelected') return currentAudio !== null

  return currentAudio !== null && !isPlaying
}
