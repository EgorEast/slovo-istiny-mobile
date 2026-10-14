import { Checkbox } from 'expo-checkbox'
import { type ReactElement } from 'react'
import { Text, View } from 'react-native'
import { useTheme } from 'shared/ui/theme'
import { TouchableItem } from 'shared/ui/touchable-item'
import { styles } from './BackupSection.styles'
import { type BackupControlKey } from './backupSectionBindings'

// The section's inner controls: folder picker, export/import actions and the autosync
// toggle. `renderControlWrapper` lets the owner (the screen) wrap each control in its
// onboarding target without this feature importing onboarding (dependency inversion).
export const BackupControls = ({
  autosyncEnabled,
  canFolderSync,
  folderUri,
  isFolderUsable,
  onChooseFolder,
  onExport,
  onImport,
  onToggleAutosync,
  renderControlWrapper,
}: {
  autosyncEnabled: boolean
  canFolderSync: boolean
  folderUri: null | string
  isFolderUsable: boolean
  onChooseFolder: () => void
  onExport: () => void
  onImport: () => void
  onToggleAutosync: (value: boolean) => void
  renderControlWrapper?: (control: ReactElement, controlKey: BackupControlKey) => ReactElement
}) => {
  const { currentTheme } = useTheme()
  const actionStyle = [styles.action, { borderColor: currentTheme.textMuted }]
  const actionTextStyle = [styles.actionText, { color: currentTheme.text }]
  const wrap = (control: ReactElement, controlKey: BackupControlKey) =>
    renderControlWrapper === undefined ? control : renderControlWrapper(control, controlKey)

  return (
    <>
      <View style={styles.actions}>
        {canFolderSync &&
          wrap(
            <TouchableItem style={actionStyle} onPress={onChooseFolder}>
              <Text style={actionTextStyle}>
                {folderUri && isFolderUsable ? 'Сменить папку' : 'Выбрать папку'}
              </Text>
            </TouchableItem>,
            'folder',
          )}
        {wrap(
          <TouchableItem onPress={onExport} style={actionStyle}>
            <Text style={actionTextStyle}>
              {canFolderSync ? 'Создать новый экспорт' : 'Скачать копию'}
            </Text>
          </TouchableItem>,
          'export',
        )}
        {wrap(
          <TouchableItem onPress={onImport} style={actionStyle}>
            <Text style={actionTextStyle}>
              {canFolderSync ? 'Импортировать' : 'Загрузить из файла'}
            </Text>
          </TouchableItem>,
          'import',
        )}
      </View>
      {canFolderSync &&
        wrap(
          <View style={styles.autosyncRow}>
            <Text style={[styles.autosyncLabel, { color: currentTheme.text }]}>
              Автосинхронизация
            </Text>
            <Checkbox
              value={autosyncEnabled}
              aria-label='Автосинхронизация'
              onValueChange={onToggleAutosync}
              disabled={!folderUri || !isFolderUsable}
              color={autosyncEnabled ? currentTheme.primary : undefined}
            />
          </View>,
          'autosync',
        )}
    </>
  )
}
