export type AutoTourDecision = 'welcome' | 'whatsNew' | null

export const resolveAutoTour = (
  seenVersion: null | string,
  currentVersion: string,
): AutoTourDecision =>
  seenVersion === null ? 'welcome' : seenVersion !== currentVersion ? 'whatsNew' : null
