import { StyleSheet, View } from 'react-native'
import { HelpHeaderButton, OnboardingTarget } from 'features/onboarding'
import { SearchToggleButton } from 'features/sermon-search'
import { INDENTS } from 'shared/ui/theme'
import { AdminShieldButton } from './AdminShieldButton'

export const ListenTopRow = ({ showAdminButton }: { showAdminButton: boolean }) => (
  <View style={styles.topRow}>
    <OnboardingTarget id='listen.search-toggle'>
      <SearchToggleButton />
    </OnboardingTarget>
    <View style={styles.topRowRight}>
      {showAdminButton && <AdminShieldButton />}
      <HelpHeaderButton />
    </View>
  </View>
)

const styles = StyleSheet.create({
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: INDENTS.low,
  },
  topRowRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: INDENTS.low,
  },
})
