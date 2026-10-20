import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { type ViewInstance } from 'react-native'
import { type AnchorRect } from 'shared/ui/menu'
import { type TrackListMenuControls } from './types'

interface TrackListItemMenu {
  dotsButtonRef: RefObject<null | ViewInstance>
  handleItemPress: () => void
  handleToggleCache: () => Promise<void>
  handleToggleMenu: () => void
  isMenuOpen: boolean
  menuAnchor: AnchorRect | null
}

// The row dropdown's lifecycle: open/close, the trigger's viewport-fixed anchor, and
// the handlers the row binds to its press/long-press and the cache toggle. Kept in its
// own hook so the row's rendering stays under the line limit.
export const useTrackListItemMenu = ({
  audioUrl,
  bindMenuOpener,
  onPress,
  toggleCache,
}: {
  audioUrl?: string
  bindMenuOpener?: (controls: TrackListMenuControls) => void
  onPress: () => void
  toggleCache: () => Promise<void>
}): TrackListItemMenu => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<AnchorRect | null>(null)
  const dotsButtonRef = useRef<ViewInstance>(null)

  // The menu renders in a viewport-fixed Modal portal, so the anchor must be
  // measured in viewport coords. measure() returns page coords on web (offset
  // by scroll) and would fly the menu away on a scrolled page.
  const measureButton = useCallback(() => {
    dotsButtonRef.current?.measureInWindow((x, y, width, height) =>
      setMenuAnchor({ height, width, x, y }),
    )
  }, [])

  const openMenu = useCallback(() => {
    if (!audioUrl) return
    measureButton()
    setIsMenuOpen(true)
  }, [audioUrl, measureButton])

  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  // Hand the dropdown controls to the owner (the tour drives the live menu).
  useEffect(() => {
    bindMenuOpener?.({ close: closeMenu, open: openMenu })
  }, [bindMenuOpener, closeMenu, openMenu])

  const handleToggleMenu = () => {
    if (isMenuOpen) closeMenu()
    else openMenu()
  }

  const handleToggleCache = async () => {
    setIsMenuOpen(false)
    await toggleCache()
  }

  const handleItemPress = () => {
    if (isMenuOpen) closeMenu()
    onPress()
  }

  return {
    dotsButtonRef,
    handleItemPress,
    handleToggleCache,
    handleToggleMenu,
    isMenuOpen,
    menuAnchor,
  }
}
