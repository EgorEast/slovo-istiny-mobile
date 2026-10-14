import { useEffect, useState } from 'react'
import { CollapsibleGroup } from 'shared/ui/collapsible-group'
import { folderLabel } from '../lib/fileIo'
import { AutosyncConflictDialog } from './AutosyncConflictDialog'
import { BackupControls } from './BackupControls'
import { BackupFileChooserDialog } from './BackupFileChooserDialog'
import { BackupImportModeDialog } from './BackupImportModeDialog'
import { type BackupSectionBindings } from './backupSectionBindings'
import { ServerUrlChangeDialog } from './ServerUrlChangeDialog'
import { useBackupSection } from './useBackupSection'

const UNAVAILABLE_FOLDER_LABEL = 'Папка недоступна — выберите заново'
const TITLE = 'Резервная копия данных'

export const BackupSection = ({ bindControls, renderControlWrapper }: BackupSectionBindings) => {
  const [expanded, setExpanded] = useState(false)
  const {
    applyPending,
    autosyncEnabled,
    backupFileOptions,
    cancelServerUrlChange,
    canFolderSync,
    canImportConflict,
    chooseFolder,
    confirmServerUrlChange,
    conflictVisible,
    dismissFileChooser,
    dismissPending,
    exportBackup,
    exportFromPicker,
    folderUri,
    importBackup,
    importFromPicker,
    isDialogVisible,
    isFolderUsable,
    onDismissConflict,
    onImportMerge,
    onImportReplace,
    onOverwrite,
    pendingServerUrl,
    selectBackupFile,
    toggleAutosync,
  } = useBackupSection()

  useEffect(() => {
    if (bindControls === undefined) return

    bindControls({ expand: () => setExpanded(true) })

    return () => bindControls(null)
  }, [bindControls])

  const folderText = isFolderUsable ? folderLabel(folderUri) : UNAVAILABLE_FOLDER_LABEL
  const subtitle = canFolderSync ? folderText : undefined

  const handleExport = () => void (canFolderSync ? exportBackup() : exportFromPicker())
  const handleImport = () => void (canFolderSync ? importBackup() : importFromPicker())

  return (
    <>
      <CollapsibleGroup
        title={TITLE}
        subtitle={subtitle}
        expanded={expanded}
        icon='cloud-upload-outline'
        onToggle={() => setExpanded(previous => !previous)}
      >
        <BackupControls
          folderUri={folderUri}
          onExport={handleExport}
          onImport={handleImport}
          canFolderSync={canFolderSync}
          isFolderUsable={isFolderUsable}
          autosyncEnabled={autosyncEnabled}
          onToggleAutosync={toggleAutosync}
          onChooseFolder={() => void chooseFolder()}
          renderControlWrapper={renderControlWrapper}
        />
      </CollapsibleGroup>
      <BackupImportModeDialog
        visible={isDialogVisible}
        onDismiss={dismissPending}
        onMerge={() => void applyPending('merge')}
        onReplace={() => void applyPending('replace')}
      />
      <ServerUrlChangeDialog
        newUrl={pendingServerUrl ?? ''}
        onCancel={cancelServerUrlChange}
        visible={pendingServerUrl !== null}
        onConfirm={() => void confirmServerUrlChange()}
      />
      <AutosyncConflictDialog
        visible={conflictVisible}
        onOverwrite={onOverwrite}
        canImport={canImportConflict}
        onDismiss={onDismissConflict}
        onImportMerge={onImportMerge}
        onImportReplace={onImportReplace}
      />
      <BackupFileChooserDialog
        onDismiss={dismissFileChooser}
        options={backupFileOptions ?? []}
        visible={backupFileOptions !== null}
        onSelect={fileName => void selectBackupFile(fileName)}
      />
    </>
  )
}
