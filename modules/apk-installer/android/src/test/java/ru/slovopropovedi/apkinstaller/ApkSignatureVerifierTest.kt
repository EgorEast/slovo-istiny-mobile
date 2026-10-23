package ru.slovopropovedi.apkinstaller

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ApkSignatureVerifierTest {
  @Test
  fun `sha256Hex renders lowercase hex of the certificate bytes`() {
    assertEquals(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      ApkSignatureVerifier.sha256Hex(ByteArray(0)),
    )
  }

  @Test
  fun `digestsMatch accepts identical digests regardless of case`() {
    assertTrue(
      ApkSignatureVerifier.digestsMatch(
        "AABBCC",
        "aabbcc",
      ),
    )
  }

  @Test
  fun `digestsMatch rejects different digests`() {
    assertFalse(ApkSignatureVerifier.digestsMatch("aabbcc", "aabbcd"))
  }

  @Test
  fun `digestsMatch treats a missing digest as a mismatch`() {
    assertFalse(ApkSignatureVerifier.digestsMatch(null, "aabbcc"))
    assertFalse(ApkSignatureVerifier.digestsMatch("aabbcc", null))
    assertFalse(ApkSignatureVerifier.digestsMatch(null, null))
  }
}
