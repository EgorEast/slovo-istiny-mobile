import { useAtom } from '@reatom/npm-react'
import { type ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { OnboardingTarget, onboardingTourAtom, useTourScrollable } from 'features/onboarding'
import {
  type BackupControlKey,
  BackupSection,
  type BackupSectionControls,
} from 'features/settings-backup'
import { isWebVibrationSupported } from 'shared/lib/haptics'
import { INDENTS, isMaterialYouSupported, useTheme } from 'shared/ui/theme'
import { DynamicColorsItem } from './DynamicColorsItem'
import { HapticsSettingsItem } from './HapticsSettingsItem'
import { ServerUrlSettings } from './ServerUrlSettings'
import { SettingsItem } from './SettingsItem'
import { ThemeDialog } from './ThemeDialog'
import { ToursSettingsItem } from './ToursSettingsItem'

const BACKUP_TOUR_SCENARIO_ID = 'backup'
const BACKUP_TARGET_IDS: Record<BackupControlKey, string> = {
  autosync: 'settings.backup-autosync',
  export: 'settings.backup-export',
  folder: 'settings.backup-folder',
  import: 'settings.backup-import',
}

export const SettingsScreen = () => {
  const [showThemeDialog, setShowThemeDialog] = useState(false)
  const [tour] = useAtom(onboardingTourAtom)
  const { currentTheme } = useTheme()
  const tourScrollableRef = useTourScrollable()
  const backupControlsRef = useRef<BackupSectionControls | null>(null)
  const showHapticsItem = Platform.OS !== 'web' || isWebVibrationSupported()
  const isBackupTour = tour?.scenarioId === BACKUP_TOUR_SCENARIO_ID

  const bindBackupControls = useCallback((controls: BackupSectionControls | null) => {
    backupControlsRef.current = controls
  }, [])

  const wrapBackupControl = useCallback(
    (control: ReactElement, controlKey: BackupControlKey) => (
      <OnboardingTarget id={BACKUP_TARGET_IDS[controlKey]}>{control}</OnboardingTarget>
    ),
    [],
  )

  // The backup tour's controls live inside a collapsed group: expand it so its targets
  // register. The section stays onboarding-agnostic — the screen drives it via a bind.
  useEffect(() => {
    if (isBackupTour) backupControlsRef.current?.expand()
  }, [isBackupTour])

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
          <BackupSection
            bindControls={bindBackupControls}
            renderControlWrapper={wrapBackupControl}
          />
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
