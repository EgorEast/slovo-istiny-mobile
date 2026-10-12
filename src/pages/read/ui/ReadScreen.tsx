import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HelpHeaderButton, OnboardingTarget } from 'features/onboarding'
import { useFeatureFlag } from 'entities/feature-flags'
import { INDENTS, useTheme } from 'shared/ui/theme'
import { NotesForPreachersBooksSlider } from './NotesForPreachersBooksSlider'
import { TopicalAndThematicBooksSlider } from './TopicalAndThematicBooksSlider'
import { VerseByVerseBooksSlider } from './VerseByVerseBooksSlider'

export const ReadScreen = () => {
  const hasReadAccess = useFeatureFlag('read')
  const { currentTheme } = useTheme()

  // Флаги не загружены / нет доступа — экран не показывает контент.
  // Видимая блокировка таба остаётся в CustomTabBar (диалог «Скоро будет доступно»).
  if (!hasReadAccess) return null

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.topRow}>
        <HelpHeaderButton />
      </View>
      <ScrollView style={[styles.content, { backgroundColor: currentTheme.background }]}>
        <OnboardingTarget id='read.notes'>
          <NotesForPreachersBooksSlider />
        </OnboardingTarget>
        <OnboardingTarget id='read.verse-by-verse'>
          <VerseByVerseBooksSlider />
        </OnboardingTarget>
        <OnboardingTarget id='read.topical'>
          <TopicalAndThematicBooksSlider />
        </OnboardingTarget>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingBottom: 100 },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: INDENTS.medium,
    paddingVertical: INDENTS.low,
  },
})
