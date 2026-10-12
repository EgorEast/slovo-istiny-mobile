import { useAction, useAtom } from '@reatom/npm-react'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { HelpHeaderButton, OnboardingTarget } from 'features/onboarding'
import { authStatusAtom, authUserAtom, canAccessAdmin, restoreSession } from 'entities/auth'
import { APP_NAME, APP_VERSION } from 'shared/config'
import { useTheme } from 'shared/ui/theme'
import { AdminPanelButton } from './AdminPanelButton'
import { MoreMenuSettingsItem } from './MoreMenuSettingsItem'
import { styles } from './styles'

export const MoreScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { currentTheme } = useTheme()
  const restore = useAction(restoreSession)
  const [status] = useAtom(authStatusAtom)
  const [user] = useAtom(authUserAtom)

  useEffect(() => {
    if (status !== 'idle') return

    void restore()
  }, [status, restore])

  const canOpenAdminPanel = status === 'authenticated' && canAccessAdmin(user)

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[
        styles.container,
        { backgroundColor: currentTheme.background, paddingTop: insets.top },
      ]}
    >
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerTexts}>
            <Text style={[styles.appName, { color: currentTheme.text }]}>{APP_NAME}</Text>
            <Text style={styles.appVersion}>v{APP_VERSION}</Text>
          </View>
          <View style={styles.headerActions}>
            {canOpenAdminPanel && <AdminPanelButton />}
            <HelpHeaderButton />
          </View>
        </View>
        <Text style={[styles.appDescription, { color: currentTheme.textMuted }]}>
          Приложение для прослушивания и чтения проповедей
        </Text>

        <OnboardingTarget id='more.menu' style={styles.menu}>
          <OnboardingTarget id='more.offline-item'>
            <MoreMenuSettingsItem
              title='Офлайн'
              icon='cloud-offline-outline'
              onPress={() => router.push('/offline')}
            />
          </OnboardingTarget>
          <OnboardingTarget id='more.history-item'>
            <MoreMenuSettingsItem
              icon='time-outline'
              title='История прослушивания'
              onPress={() => router.push('/history')}
            />
          </OnboardingTarget>
          <OnboardingTarget id='more.settings-item'>
            <MoreMenuSettingsItem
              title='Настройки'
              icon='settings-outline'
              onPress={() => router.push('/settings')}
            />
          </OnboardingTarget>
          <MoreMenuSettingsItem
            title='О приложении'
            icon='information-circle-outline'
            onPress={() => router.push('/about')}
          />
          <MoreMenuSettingsItem
            icon='share-social-outline'
            title='Поделиться приложением'
            onPress={() => router.push('/share')}
          />
        </OnboardingTarget>
      </ScrollView>
    </SafeAreaView>
  )
}
