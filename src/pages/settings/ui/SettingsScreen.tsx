import { useState } from 'react'
import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { OnboardingTarget, useTourScrollable } from 'features/onboarding'
import { BackupSection } from 'features/settings-backup'
import { isWebVibrationSupported } from 'shared/lib/haptics'
import { INDENTS, isMaterialYouSupported, useTheme } from 'shared/ui/theme'
import { DynamicColorsItem } from './DynamicColorsItem'
import { HapticsSettingsItem } from './HapticsSettingsItem'
import { ServerUrlSettings } from './ServerUrlSettings'
import { SettingsItem } from './SettingsItem'
import { ThemeDialog } from './ThemeDialog'
import { ToursSettingsItem } from './ToursSettingsItem'

export const SettingsScreen = () => {
  const [showThemeDialog, setShowThemeDialog] = useState(false)
  const { currentTheme } = useTheme()
  const tourScrollableRef = useTourScrollable()
  const showHapticsItem = Platform.OS !== 'web' || isWebVibrationSupported()

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView ref={tourScrollableRef} contentContainerStyle={styles.content}>
        <SettingsItem
          title='Тема оформления'
          icon='color-palette-outline'
          onboardingTargetId='settings.theme'
          description='Светлая, тёмная или как в системе'
          onPress={() => {
            setShowThemeDialog(true)
          }}
        />
        {isMaterialYouSupported() && <DynamicColorsItem />}
        {showHapticsItem && <HapticsSettingsItem onboardingTargetId='settings.haptics' />}
        <ToursSettingsItem onboardingTargetId='settings.tours' />
        <OnboardingTarget id='settings.backup'>
          <BackupSection />
        </OnboardingTarget>
        <ServerUrlSettings onboardingTargetId='settings.server' />
      </ScrollView>
      <ThemeDialog
        visible={showThemeDialog}
        onDismiss={() => {
          setShowThemeDialog(false)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: INDENTS.high,
  },
})
