import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import { useEffect, useMemo, useRef } from 'react'
import { OnboardingHelpRow } from 'features/onboarding'
import { IconButton } from 'shared/ui/icon-button'
import { useTheme } from 'shared/ui/theme'

const SAVE_LABEL = 'Сохранить изменения'
const ICON_SIZE = 22

/**
 * Правая кнопка шапки экрана редактирования плейлиста — галочка «Сохранить
 * изменения». Ставится через `navigation.setOptions` (паттерн
 * `usePlaylistNavigationOptions`), очищается на размонтировании.
 *
 * Обработчик сохранения держим в ref: `save` меняет идентичность на каждое
 * изменение формы, и без ref `setOptions` вызывался бы на каждый ввод. `canSave`
 * входит в идентичность `headerRight` намеренно — иначе disabled-состояние
 * галочки не обновилось бы при появлении/сбросе изменений.
 * @param root0 - Параметры шапки.
 * @param root0.canSave - Доступно ли сохранение (есть изменения).
 * @param root0.onSave - Обработчик сохранения.
 */
export const usePlaylistEditHeader = ({
  canSave,
  onSave,
}: {
  canSave: boolean
  onSave: () => void
}) => {
  const navigation = useNavigation()
  const { currentTheme } = useTheme()
  const onSaveRef = useRef(onSave)

  useEffect(() => {
    onSaveRef.current = onSave
  })

  const headerRight = useMemo(
    () => () => (
      <OnboardingHelpRow tintColor={currentTheme.primary}>
        <IconButton
          disabled={!canSave}
          accessibilityLabel={SAVE_LABEL}
          onPress={() => onSaveRef.current()}
          Icon={<Ionicons size={ICON_SIZE} name='checkmark' color={currentTheme.primary} />}
        />
      </OnboardingHelpRow>
    ),
    [canSave, currentTheme.primary],
  )

  useEffect(() => {
    navigation.setOptions({ headerRight })
    return () => {
      navigation.setOptions({ headerRight: undefined })
    }
  }, [navigation, headerRight])
}
