import { useAction } from '@reatom/npm-react'
import { useEffect } from 'react'
import { advanceEntryTransition } from '../model/entry'

// Advances the entry transition phase: an already-reached step is skipped at once,
// otherwise the phase waits for the blink and the router to land on the step's route.
// Each advance moves to the next entry step; the last one lands the tour on the card.
// `stepKey` changes per entry step, so consecutive skips keep advancing.
export const useTourEntryStep = ({
  isEntryDone,
  isEntryPhase,
  stepKey,
}: {
  isEntryDone: boolean
  isEntryPhase: boolean
  stepKey: string
}) => {
  const advance = useAction(advanceEntryTransition)

  useEffect(() => {
    if (!isEntryPhase) return
    if (!isEntryDone) return

    advance()
  }, [advance, isEntryDone, isEntryPhase, stepKey])
}
