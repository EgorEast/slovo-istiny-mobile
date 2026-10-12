import { type PropsWithChildren } from 'react'
import { StyleSheet, View } from 'react-native'
import { INDENTS } from 'shared/ui/theme'
import { HelpHeaderButton } from './HelpHeaderButton'

export const OnboardingHelpRow = ({
  children,
  tintColor,
}: PropsWithChildren<{ tintColor?: string }>) => (
  <View style={styles.row}>
    <HelpHeaderButton tintColor={tintColor} />
    {children}
  </View>
)

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: INDENTS.low,
  },
})
