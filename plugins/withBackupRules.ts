import fs from 'fs'
import path from 'path'
import { type ConfigPlugin, withAndroidManifest, withDangerousMod } from '@expo/config-plugins'

// Android auto-backup / Seedvault / device-to-device migration must keep working for
// user data (playlists, listening history, settings). The one thing that must never
// leave the device is auth material: expo-secure-store keeps its payload in
// getSharedPreferences("SecureStore", MODE_PRIVATE) → shared_prefs/SecureStore.xml,
// sealed by an Android Keystore key that cannot be restored on another device anyway.
// These rules exclude just that prefs file and leave everything else included.
const SECURE_STORE_PREFS_FILE = 'SecureStore.xml'

const XML_RES_DIR_RELATIVE_PATH = path.join('app', 'src', 'main', 'res', 'xml')
const BACKUP_RULES_FILENAME = 'backup_rules.xml'
const DATA_EXTRACTION_RULES_FILENAME = 'data_extraction_rules.xml'

// API <= 30 (legacy fullBackupContent format).
const BACKUP_RULES_XML = `<?xml version="1.0" encoding="utf-8"?>
<!-- Auto-backup rules for Android 11 and lower: user data stays included, the
     Expo SecureStore prefs file is excluded (auth material never enters backups). -->
<full-backup-content>
    <exclude domain="sharedpref" path="${SECURE_STORE_PREFS_FILE}"/>
</full-backup-content>
`

// API 31+ (dataExtractionRules format, replaces fullBackupContent on Android 12+).
const DATA_EXTRACTION_RULES_XML = `<?xml version="1.0" encoding="utf-8"?>
<!-- Backup and device-transfer rules for Android 12+: user data stays included so
     Seedvault / device migration restores it; the Expo SecureStore prefs file is
     excluded from both cloud backup and direct transfer. -->
<data-extraction-rules>
    <cloud-backup>
        <exclude domain="sharedpref" path="${SECURE_STORE_PREFS_FILE}"/>
        <exclude domain="device_sharedpref" path="${SECURE_STORE_PREFS_FILE}"/>
    </cloud-backup>
    <device-transfer>
        <exclude domain="sharedpref" path="${SECURE_STORE_PREFS_FILE}"/>
        <exclude domain="device_sharedpref" path="${SECURE_STORE_PREFS_FILE}"/>
    </device-transfer>
</data-extraction-rules>
`

const MISSING_APPLICATION_ERROR = 'withBackupRules: <application> not found in AndroidManifest.xml'

// Idempotent: writes only when the generated file differs from the desired content.
const writeIfChanged = (filePath: string, contents: string): void => {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null

  if (existing === contents) return

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, contents)
}

// Manifest side: point <application> at both rule files. Setting the attributes is
// inherently idempotent. The dangerous mod writes res/xml/* files after the manifest
// mod has persisted the parsed manifest, then this plugin's manifest attributes and
// withAndroidManifestCleanup's meta-data stripping both survive (cleanup never touches
// application attributes).
export const withBackupRules: ConfigPlugin = config => {
  const withManifestAttributes = withAndroidManifest(config, manifestConfig => {
    const application = manifestConfig.modResults.manifest.application?.[0]

    if (!application) throw new Error(MISSING_APPLICATION_ERROR)

    application.$['android:fullBackupContent'] = '@xml/backup_rules'
    application.$['android:dataExtractionRules'] = '@xml/data_extraction_rules'

    return manifestConfig
  })

  return withDangerousMod(withManifestAttributes, [
    'android',
    dangerousConfig => {
      const resXmlDir = path.join(
        dangerousConfig.modRequest.platformProjectRoot,
        XML_RES_DIR_RELATIVE_PATH,
      )

      writeIfChanged(path.join(resXmlDir, BACKUP_RULES_FILENAME), BACKUP_RULES_XML)
      writeIfChanged(
        path.join(resXmlDir, DATA_EXTRACTION_RULES_FILENAME),
        DATA_EXTRACTION_RULES_XML,
      )

      return dangerousConfig
    },
  ])
}
