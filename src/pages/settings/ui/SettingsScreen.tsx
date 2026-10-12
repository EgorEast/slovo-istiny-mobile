import { useState } from 'react'
import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { OnboardingTarget } from 'features/onboarding'
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
  const showHapticsItem = Platform.OS !== 'web' || isWebVibrationSupported()

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <OnboardingTarget id='settings.theme'>
          <SettingsItem
            title='Тема оформления'
            icon='color-palette-outline'
            description='Светлая, тёмная или как в системе'
            onPress={() => {
              setShowThemeDialog(true)
            }}
          />
        </OnboardingTarget>
        {isMaterialYouSupported() && <DynamicColorsItem />}
        <OnboardingTarget id='settings.haptics'>
          {showHapticsItem && <HapticsSettingsItem />}
        </OnboardingTarget>
        <OnboardingTarget id='settings.tours'>
          <ToursSettingsItem />
        </OnboardingTarget>
        <OnboardingTarget id='settings.backup'>
          <BackupSection />
        </OnboardingTarget>
        <OnboardingTarget id='settings.server'>
          <ServerUrlSettings />
        </OnboardingTarget>
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
