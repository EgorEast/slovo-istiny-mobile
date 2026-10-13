import { StyleSheet, View } from 'react-native'
import { useTheme, withAlpha } from 'shared/ui/theme'
import { type OnboardingTargetRect } from '../model'

const AREA_BORDER_OPACITY = 0.6
const AREA_BORDER_WIDTH = 1.5
const AREA_FILL_OPACITY = 0.18
const AREA_RADIUS = 12
const AREA_HIGHLIGHT_TEST_ID = 'onboarding-area-highlight'

// The translucent fill that keeps a highlighted zone visible and obvious while the
// background around it is dimmed. Sits on top of the matching TourDim hole (the hole
// is the rect expanded by HOLE_PADDING, so the fill already rests inside it).
export const TourAreaHighlight = ({ rect }: { rect: OnboardingTargetRect }) => {
  const { currentTheme } = useTheme()

  return (
    <View
      pointerEvents='none'
      testID={AREA_HIGHLIGHT_TEST_ID}
      style={[
        styles.area,
        {
          backgroundColor: withAlpha(currentTheme.primary, AREA_FILL_OPACITY),
          borderColor: withAlpha(currentTheme.primary, AREA_BORDER_OPACITY),
          height: rect.height,
          left: rect.x,
          top: rect.y,
          width: rect.width,
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  area: {
    borderRadius: AREA_RADIUS,
    borderWidth: AREA_BORDER_WIDTH,
    position: 'absolute',
  },
})
