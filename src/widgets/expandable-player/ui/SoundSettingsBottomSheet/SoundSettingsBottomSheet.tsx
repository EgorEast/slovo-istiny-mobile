import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { memo, useCallback, useRef } from 'react'
import { StyleSheet, Text } from 'react-native'
import { OnboardingTarget } from 'features/onboarding'
import { FONT_SIZES, INDENTS, useTheme } from 'shared/ui/theme'
import { FINAL_SNAP_INDEX, useSheetSnapMetrics } from '../../lib/useSheetSnapMetrics'
import { SoundSettingsContent } from './SoundSettingsContent'
import { SoundSheetBackdrop } from './SoundSheetBackdrop'

const TITLE = 'Настройки звука'
const CLOSED_INDEX = -1

const SoundSettingsBottomSheetComponent = ({ onClose }: { onClose: () => void }) => {
  const { currentTheme } = useTheme()
  const sheetRef = useRef<BottomSheet>(null)
  // Snap detents + safe-area handling shared with the playlist sheet.
  const { snapPoints } = useSheetSnapMetrics()

  // Mount-open never fires onAnimate; the change callback is the only reliable
  // settle signal (see docs/features/player.md → «Шторка плейлиста»).
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === CLOSED_INDEX) onClose()
    },
    [onClose],
  )

  return (
    <BottomSheet
      ref={sheetRef}
      enablePanDownToClose
      snapPoints={snapPoints}
      index={FINAL_SNAP_INDEX}
      enableDynamicSizing={false}
      onChange={handleSheetChanges}
      backdropComponent={SoundSheetBackdrop}
      backgroundStyle={{ backgroundColor: currentTheme.surface }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.textMuted }}
    >
      <OnboardingTarget style={styles.container} id='player-fullscreen.sound-sheet'>
        <Text style={[styles.title, { color: currentTheme.text }]}>{TITLE}</Text>
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SoundSettingsContent />
        </BottomSheetScrollView>
      </OnboardingTarget>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: INDENTS.medium },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: INDENTS.medium,
    paddingHorizontal: INDENTS.medium,
  },
})

export const SoundSettingsBottomSheet = memo(SoundSettingsBottomSheetComponent)
