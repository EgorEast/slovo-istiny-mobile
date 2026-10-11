import { Checkbox } from 'expo-checkbox'
import { Text, View } from 'react-native'
import { useTheme } from '../theme/ThemeContext/useTheme'
import { TouchableItem } from '../touchable-item'
import { formStyles } from './formStyles'

// Чекбокс формы с подписью и необязательной подсказкой под строкой; тап по
// всей строке переключает значение. Сам чекбокс неинтерактивен
// (`pointerEvents='none'`): иначе нативная/web-галочка перехватывает тап и
// состояние не меняется — нажатие должно обрабатывать только обёртка строки
// (один обработчик, без двойного переключения). `disabled` отключает тап
// (нет переключения) и приглушает подпись; `hint` объясняет причину.
export const CheckboxField = ({
  disabled = false,
  hint,
  label,
  onChange,
  value,
}: {
  disabled?: boolean
  hint?: string
  label: string
  onChange: (value: boolean) => void
  value: boolean
}) => {
  const { currentTheme } = useTheme()

  return (
    <View>
      <TouchableItem
        disabled={disabled}
        noDisabledBackground
        style={formStyles.checkboxRow}
        onPress={() => onChange(!value)}
        accessibilityState={{ checked: value, disabled }}
      >
        <Checkbox
          value={value}
          pointerEvents='none'
          style={formStyles.checkbox}
          color={value ? currentTheme.primary : currentTheme.textMuted}
        />
        <Text
          style={[
            formStyles.checkboxLabel,
            { color: disabled ? currentTheme.textMuted : currentTheme.text },
          ]}
        >
          {label}
        </Text>
      </TouchableItem>
      {hint ? (
        <Text style={[formStyles.hint, { color: currentTheme.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  )
}
