type TourAction = () => void

// Single-tour app: an action id maps to exactly one handler, registered by the
// component that owns the live control while it is mounted. The tour performs the
// handler instead of navigating. Module-level mutable registry is the established
// cross-component pattern here (see tourScrollable).
const actions = new Map<string, TourAction>()

export const registerTourAction = (id: string, action: TourAction) => {
  actions.set(id, action)
}

export const unregisterTourAction = (id: string) => {
  actions.delete(id)
}

export const getTourAction = (id: string) => actions.get(id)
