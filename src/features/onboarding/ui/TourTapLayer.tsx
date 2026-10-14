import { Modal, StyleSheet, View } from 'react-native'
import { type OnboardingTargetRect } from '../model/targets'
import { TapIndicator } from './TapIndicator'

const MODAL_TEST_ID = 'onboarding-tap-modal'

// The blink phase paints the pulsing circle in its own native window — a fresh Modal
// keyed per step, so it lands above app dropdowns/modals already presented (e.g. the
// row-menu AnchoredDropdown, which paints with zIndex inside the screen subtree).
// Touches are blocked for the ~2.4s blink: the tour performs the tap itself, so the
// live control is not meant to be pressed meanwhile.
export const TourTapLayer = ({
  onClose,
  rect,
  stepKey,
}: {
  onClose: () => void
  rect: OnboardingTargetRect
  stepKey: string
}) => (
  <Modal
    visible
    transparent
    key={stepKey}
    animationType='none'
    testID={MODAL_TEST_ID}
    onRequestClose={onClose}
  >
    <View pointerEvents='none' style={StyleSheet.absoluteFill}>
      <TapIndicator rect={rect} />
    </View>
  </Modal>
)
