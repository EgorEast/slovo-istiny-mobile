package ru.slovopropovedi.apkinstaller

import android.content.pm.PackageInstaller

private const val SIGNATURE_MISMATCH_HINT = "INSTALL_FAILED_UPDATE_INCOMPATIBLE"
private const val SIGNATURE_MISMATCH_STATUS = "SIGNATURE_MISMATCH"

/**
 * Pure status mapping for the install broadcast: no Android calls, only
 * compile-time SDK int constants, so it is unit-testable on the JVM.
 */
internal object ApkInstallStatuses {
  /**
   * Rejection code shared by the pre-install signature check and the broadcast
   * classifier, so the JS side has a single machine-readable code to map.
   */
  const val SIGNATURE_MISMATCH_CODE = "INSTALL_SIGNATURE_MISMATCH"

  /** Message for the pre-install check, which never reaches a PackageInstaller status. */
  fun signatureMismatchMessage(): String =
    "Install failed: $SIGNATURE_MISMATCH_STATUS, message=APK signing certificate does not match the installed app"

  fun statusName(status: Int): String = when (status) {
    PackageInstaller.STATUS_FAILURE -> "STATUS_FAILURE"
    PackageInstaller.STATUS_FAILURE_ABORTED -> "STATUS_FAILURE_ABORTED"
    PackageInstaller.STATUS_FAILURE_BLOCKED -> "STATUS_FAILURE_BLOCKED"
    PackageInstaller.STATUS_FAILURE_CONFLICT -> "STATUS_FAILURE_CONFLICT"
    PackageInstaller.STATUS_FAILURE_INCOMPATIBLE -> "STATUS_FAILURE_INCOMPATIBLE"
    PackageInstaller.STATUS_FAILURE_INVALID -> "STATUS_FAILURE_INVALID"
    else -> "STATUS_FAILURE_STORAGE"
  }

  /**
   * Stable rejection code for the JS classifier (the first argument of
   * `Promise.reject`). Status names double as codes; a signature mismatch gets
   * its own code because the SDK only reports the coarse failure status while
   * the user needs the "uninstall and reinstall" explanation.
   */
  fun failureCode(status: Int, extraMessage: String?): String =
    if (extraMessage?.contains(SIGNATURE_MISMATCH_HINT) == true) {
      SIGNATURE_MISMATCH_CODE
    } else {
      statusName(status)
    }

  fun failureMessage(status: Int, extraMessage: String?, legacyStatus: Int): String =
    "Install failed: ${statusName(status)}, message=$extraMessage, legacyStatus=$legacyStatus"
}
