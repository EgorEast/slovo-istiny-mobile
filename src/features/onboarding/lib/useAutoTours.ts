import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAction, useAtom } from '@reatom/npm-react'
import { useEffect, useRef } from 'react'
import { APP_VERSION } from 'shared/config'
import { setToursSeenVersion, TOURS_SEEN_VERSION_KEY, toursDisabledAtom } from 'shared/model'
import { onboardingTourAtom, startOnboardingTour } from '../model'
import { type AutoTourDecision, resolveAutoTour } from './resolveAutoTour'

const AUTO_TOUR_DELAY_MS = 2500

export const useAutoTours = () => {
  const [toursDisabled] = useAtom(toursDisabledAtom)
  const [activeTour] = useAtom(onboardingTourAtom)
  const setSeenVersion = useAction(setToursSeenVersion)
  const startTour = useAction(startOnboardingTour)
  const isDecidedRef = useRef(false)

  useEffect(() => {
    if (isDecidedRef.current) return

    const timer = setTimeout(() => {
      isDecidedRef.current = true

      void (async () => {
        if (toursDisabled) return

        const seen = await AsyncStorage.getItem(TOURS_SEEN_VERSION_KEY)
        const decision: AutoTourDecision = resolveAutoTour(seen, APP_VERSION)
        if (decision === null) return

        await setSeenVersion(APP_VERSION)
        if (activeTour === null) startTour(decision)
      })()
    }, AUTO_TOUR_DELAY_MS)

    return () => clearTimeout(timer)
  }, [activeTour, setSeenVersion, startTour, toursDisabled])
}
