import { View } from 'react-native'
import { type TouchedMap } from 'shared/lib/hooks/useFormTouched'
import { INPUT_LIMITS } from 'shared/lib/validation/inputLimits'
import { FormField, FormGroupTitle } from 'shared/ui/form'
import { useTheme } from 'shared/ui/theme'
import { type PlaylistFormValues } from '../lib/playlistFormState'
import { styles } from './styles'

type UpdateField = <K extends keyof PlaylistFormValues>(
  key: K,
  value: PlaylistFormValues[K],
) => void

const isBlank = (value: string) => value.trim() === ''

// Блок «Основное» формы плейлиста: название (обязательно) и описание.
export const PlaylistFormMainFields = ({
  markTouched,
  onChange,
  touched,
  values,
}: {
  markTouched: (key: 'title') => void
  onChange: UpdateField
  touched: TouchedMap<'title'>
  values: PlaylistFormValues
}) => {
  const { currentTheme } = useTheme()

  return (
    <View style={styles.group}>
      <FormGroupTitle style={[styles.blockTitle, { color: currentTheme.text }]}>
        Основное
      </FormGroupTitle>
      <FormField
        required
        label='Название'
        value={values.title}
        onBlur={() => markTouched('title')}
        maxLength={INPUT_LIMITS.playlist.title}
        placeholder='Например: Воскресные проповеди'
        onChangeText={text => onChange('title', text)}
        invalid={Boolean(touched.title) && isBlank(values.title)}
      />
      <FormField
        multiline
        label='Описание'
        hint='Необязательно.'
        value={values.description}
        placeholder='Короткое описание плейлиста'
        maxLength={INPUT_LIMITS.playlist.description}
        onChangeText={text => onChange('description', text)}
      />
    </View>
  )
}
