package ru.slovopropovedi.apkinstaller

import java.security.MessageDigest

/**
 * Pure signature-digest helpers: no Android API calls, so the archive/installed
 * comparison stays unit-testable on the JVM.
 */
internal object ApkSignatureVerifier {
  fun sha256Hex(certificateBytes: ByteArray): String =
    MessageDigest.getInstance("SHA-256")
      .digest(certificateBytes)
      .joinToString("") { byte -> "%02x".format(byte.toInt() and 0xFF) }

  /**
   * Case-insensitive digest comparison. A missing digest on either side means
   * the certificate could not be read, which is treated as a mismatch.
   */
  fun digestsMatch(archiveDigest: String?, installedDigest: String?): Boolean =
    archiveDigest != null &&
      installedDigest != null &&
      archiveDigest.equals(installedDigest, ignoreCase = true)
}
