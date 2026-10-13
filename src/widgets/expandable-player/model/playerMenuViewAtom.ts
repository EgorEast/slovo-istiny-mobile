import { atom } from '@reatom/framework'

// Which page the popover menu shows. Lifted out of PlayerMenu's local state so the
// onboarding tour can switch to the speed page through a registered tour action
// (see lib/usePlayerTourActions.ts) without reaching into the component.
export const playerMenuViewAtom = atom<'main' | 'speed'>('main', 'playerMenuViewAtom')
