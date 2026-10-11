import { type Href, Stack, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { useAdminFormHeader } from 'widgets/admin-form-header'
import { useTheme } from 'shared/ui/theme'
import {
  parsePublishSermonsParam,
  parseSermonIdsParam,
  parseTitleParam,
  type PlaylistFormValues,
} from '../lib/playlistFormState'
import { usePlaylistFormController } from '../lib/usePlaylistFormController'
import { PlaylistForm } from './PlaylistForm'
import { styles } from './styles'

const PLAYLISTS_FALLBACK_ROUTE: Href = '/admin/playlists'

// Экран создания плейлиста: форма в режиме create + «Сохранить» в шапке.
export const AdminPlaylistCreateScreen = () => {
  const { currentTheme } = useTheme()
  const params = useLocalSearchParams<{
    sermonIds?: string | string[]
    sermons?: string | string[]
    title?: string | string[]
  }>()
  const parsedSermons = parsePublishSermonsParam(params.sermons)
  const presetValues: PlaylistFormValues = {
    artwork: '',
    description: '',
    selectedSectionIds: [],
    selectedSermonIds:
      parsedSermons.ids.length > 0 ? parsedSermons.ids : parseSermonIdsParam(params.sermonIds),
    title: parseTitleParam(params.title),
  }
  const { error, isDirty, isSubmitting, markTouched, onChange, save, touched, values } =
    usePlaylistFormController({
      mode: 'create',
      presetValues,
    })
  const headerOptions = useAdminFormHeader({
    fallbackRoute: PLAYLISTS_FALLBACK_ROUTE,
    isDirty,
    isSubmitting,
    onSave: save,
    title: 'Создать плейлист',
  })

  // Enter повторяет «Сохранить»: та же доступность, что у кнопки в шапке.
  const submitOnEnter = () => {
    if (isDirty && !isSubmitting) void save()
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Stack.Screen options={headerOptions} />
      <PlaylistForm
        error={error}
        values={values}
        touched={touched}
        onChange={onChange}
        onSubmit={submitOnEnter}
        markTouched={markTouched}
        selectedSermons={parsedSermons.sermons}
      />
    </View>
  )
}
