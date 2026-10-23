package ru.slovopropovedi.apkinstaller

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageInfo
import android.content.pm.PackageInstaller
import android.content.pm.PackageManager
import android.content.pm.Signature
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.security.MessageDigest

private const val INSTALL_ACTION = "ru.slovopropovedi.apkinstaller.INSTALL_COMPLETE"

// Removed from the SDK in recent Android versions, but the system still sends it.
private const val EXTRA_LEGACY_STATUS = "android.content.pm.extra.LEGACY_STATUS"

class ApkInstallerModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private var pendingSessionId: Int = -1
  private var pendingPromise: Promise? = null

  private val installReceiver = object : BroadcastReceiver() {
    override fun onReceive(receiverContext: Context, intent: Intent) {
      val promise = pendingPromise ?: return
      val sessionId = intent.getIntExtra(PackageInstaller.EXTRA_SESSION_ID, -1)
      if (sessionId != pendingSessionId) return

      when (val status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, -1)) {
        PackageInstaller.STATUS_PENDING_USER_ACTION -> {
          val confirmationIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra(Intent.EXTRA_INTENT, Intent::class.java)
          } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra(Intent.EXTRA_INTENT)
          }
          if (confirmationIntent != null) {
            confirmationIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(confirmationIntent)
          }
        }

        PackageInstaller.STATUS_SUCCESS -> {
          pendingPromise = null
          pendingSessionId = -1
          promise.resolve(mapOf("status" to "success"))
        }

        PackageInstaller.STATUS_FAILURE,
        PackageInstaller.STATUS_FAILURE_ABORTED,
        PackageInstaller.STATUS_FAILURE_BLOCKED,
        PackageInstaller.STATUS_FAILURE_CONFLICT,
        PackageInstaller.STATUS_FAILURE_INCOMPATIBLE,
        PackageInstaller.STATUS_FAILURE_INVALID,
        PackageInstaller.STATUS_FAILURE_STORAGE -> {
          pendingPromise = null
          pendingSessionId = -1
          val statusMessage = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE)
          val legacyStatus = intent.getIntExtra(EXTRA_LEGACY_STATUS, -1)
          promise.reject(
            ApkInstallStatuses.failureCode(status, statusMessage),
            ApkInstallStatuses.failureMessage(status, statusMessage, legacyStatus),
            null,
          )
        }
      }
    }
  }

  override fun definition() = ModuleDefinition {
    Name("ApkInstaller")

    OnCreate {
      val filter = IntentFilter(INSTALL_ACTION)
      ContextCompat.registerReceiver(
        context,
        installReceiver,
        filter,
        ContextCompat.RECEIVER_NOT_EXPORTED,
      )
    }

    OnDestroy {
      context.unregisterReceiver(installReceiver)
    }

    AsyncFunction("installApk") { apkPath: String, promise: Promise ->
      installApk(apkPath, promise)
    }

    AsyncFunction("canRequestPackageInstalls") { promise: Promise ->
      promise.resolve(canRequestPackageInstalls())
    }

    AsyncFunction("openInstallPermissionSettings") { promise: Promise ->
      openInstallPermissionSettings(promise)
    }

    AsyncFunction("computeSha256") { fileUri: String, promise: Promise ->
      computeSha256(fileUri, promise)
    }
  }

  private fun installApk(apkPath: String, promise: Promise) {
    if (pendingPromise != null) {
      promise.reject("ERR_APK_INSTALL_IN_PROGRESS", "An install session is already in progress", null)
      return
    }

    val realPath = Uri.parse(apkPath).path
    if (realPath == null) {
      promise.reject("ERR_APK_INSTALL_INVALID_PATH", "Invalid APK path: $apkPath", null)
      return
    }

    val apkFile = File(realPath)
    if (!apkFile.exists()) {
      promise.reject("ERR_APK_INSTALL_FILE_NOT_FOUND", "APK file not found at: $realPath", null)
      return
    }

    // Defense-in-depth before any session exists: an APK signed by a different
    // key can never replace this app, so fail early with the classifier's code.
    if (!hasMatchingSignature(realPath)) {
      promise.reject(
        ApkInstallStatuses.SIGNATURE_MISMATCH_CODE,
        ApkInstallStatuses.signatureMismatchMessage(),
        null,
      )
      return
    }

    val sessionParams = PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL)
    sessionParams.setAppPackageName(context.packageName)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      try {
        sessionParams.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED)
      } catch (_: Exception) {
        // Best-effort: some OEM installers ignore this flag, which is harmless.
      }
    }

    val packageInstaller = context.packageManager.packageInstaller
    val sessionId = try {
      packageInstaller.createSession(sessionParams)
    } catch (error: Exception) {
      promise.reject("ERR_APK_INSTALL_SESSION", "Failed to create install session: ${error.message}", error)
      return
    }

    pendingSessionId = sessionId
    pendingPromise = promise

    val session = try {
      packageInstaller.openSession(sessionId)
    } catch (error: Exception) {
      pendingPromise = null
      pendingSessionId = -1
      promise.reject("ERR_APK_INSTALL_SESSION_OPEN", "Failed to open install session: ${error.message}", error)
      return
    }

    try {
      val output = session.openWrite("base.apk", 0, -1)
      try {
        apkFile.inputStream().use { input -> input.copyTo(output) }
        session.fsync(output)
      } finally {
        output.close()
      }
    } catch (error: Exception) {
      session.abandon()
      pendingPromise = null
      pendingSessionId = -1
      promise.reject("ERR_APK_INSTALL_STREAM", "Failed to write APK to install session: ${error.message}", error)
      return
    }

    val pendingIntent = PendingIntent.getBroadcast(
      context,
      sessionId,
      Intent(INSTALL_ACTION).setPackage(context.packageName),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE,
    )

    try {
      session.commit(pendingIntent.intentSender)
      session.close()
    } catch (error: Exception) {
      session.abandon()
      pendingPromise = null
      pendingSessionId = -1
      promise.reject("ERR_APK_INSTALL_COMMIT", "Failed to commit install session: ${error.message}", error)
    }
  }

  private fun hasMatchingSignature(apkPath: String): Boolean {
    val packageManager = context.packageManager
    val flags = signingInfoFlags()
    val archiveInfo = packageManager.getPackageArchiveInfo(apkPath, flags) ?: return false
    val installedInfo = try {
      packageManager.getPackageInfo(context.packageName, flags)
    } catch (_: PackageManager.NameNotFoundException) {
      return false
    }

    return ApkSignatureVerifier.digestsMatch(
      firstCertificateDigest(archiveInfo),
      firstCertificateDigest(installedInfo),
    )
  }

  private fun firstCertificateDigest(packageInfo: PackageInfo): String? {
    val signatures: Array<Signature>? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      packageInfo.signingInfo?.apkContentsSigners
    } else {
      @Suppress("DEPRECATION")
      packageInfo.signatures
    }
    val certificate = signatures?.firstOrNull() ?: return null
    return ApkSignatureVerifier.sha256Hex(certificate.toByteArray())
  }

  private fun signingInfoFlags(): Int =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      PackageManager.GET_SIGNING_CERTIFICATES
    } else {
      @Suppress("DEPRECATION")
      PackageManager.GET_SIGNATURES
    }

  private fun canRequestPackageInstalls(): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return true
    return context.packageManager.canRequestPackageInstalls()
  }

  private fun computeSha256(fileUri: String, promise: Promise) {
    val realPath = Uri.parse(fileUri).path
    if (realPath == null) {
      promise.reject("ERR_APK_HASH_INVALID_PATH", "Invalid file path: $fileUri", null)
      return
    }

    val file = File(realPath)
    if (!file.exists()) {
      promise.reject("ERR_APK_HASH_FILE_NOT_FOUND", "File not found at: $realPath", null)
      return
    }

    try {
      val digest = MessageDigest.getInstance("SHA-256")
      file.inputStream().buffered().use { input ->
        val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
        while (true) {
          val read = input.read(buffer)
          if (read < 0) break
          digest.update(buffer, 0, read)
        }
      }
      promise.resolve(digest.digest().joinToString("") { byte -> "%02x".format(byte.toInt() and 0xFF) })
    } catch (error: Exception) {
      promise.reject("ERR_APK_HASH", "Failed to compute SHA-256: ${error.message}", error)
    }
  }

  private fun openInstallPermissionSettings(promise: Promise) {
    val intent = Intent(
      Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
      Uri.parse("package:${context.packageName}"),
    ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

    try {
      context.startActivity(intent)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject(
        "ERR_APK_INSTALL_SETTINGS",
        "Failed to open install permission settings: ${error.message}",
        error,
      )
    }
  }
}