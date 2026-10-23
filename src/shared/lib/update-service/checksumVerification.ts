import * as ApkInstaller from 'apk-installer'
import { assertAllowedUpdateUrl } from './downloadUrlPolicy'

const SUMS_FILE_NAME = 'SHA256SUMS.txt'
const SUMS_DOWNLOAD_TIMEOUT_MS = 10_000
// Standard `sha256sum` line: "<hex>  <filename>" (or "<hex> *<filename>").
const CHECKSUM_LINE_PATTERN = /^([a-f0-9]{64})\s+\*?(.+?)\s*$/i

const extractAssetFileName = (url: string): string => {
  const pathname = new URL(url).pathname
  const fileName = decodeURIComponent(pathname.split('/').pop() ?? '')
  if (!fileName) throw new Error(`[updateService] Cannot determine archive name from URL: ${url}`)
  return fileName
}

export const findSha256ForAsset = (sumsText: string, assetName: string): null | string => {
  const targetName = assetName.toLowerCase()
  for (const line of sumsText.split(/\r?\n/)) {
    const match = CHECKSUM_LINE_PATTERN.exec(line.trim())
    if (match && match[2].toLowerCase() === targetName) return match[1].toLowerCase()
  }
  return null
}

export const downloadChecksumText = async (sumsDownloadUrl: null | string): Promise<string> => {
  if (!sumsDownloadUrl)
    throw new Error(
      `[updateService] Release has no ${SUMS_FILE_NAME} asset — refusing to install an unverified update`,
    )
  assertAllowedUpdateUrl(sumsDownloadUrl)

  const abortController = new AbortController()
  const timeoutId = setTimeout(() => abortController.abort(), SUMS_DOWNLOAD_TIMEOUT_MS)
  try {
    const response = await fetch(sumsDownloadUrl, { signal: abortController.signal })
    if (!response.ok)
      throw new Error(
        `[updateService] Failed to download ${SUMS_FILE_NAME}: HTTP ${response.status}`,
      )
    return await response.text()
  } catch (error) {
    if (abortController.signal.aborted)
      throw new Error(`[updateService] Downloading ${SUMS_FILE_NAME} timed out`, { cause: error })
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export const verifyDownloadedZipChecksum = async (
  zipUri: string,
  zipDownloadUrl: string,
  sumsText: string,
): Promise<void> => {
  const assetName = extractAssetFileName(zipDownloadUrl)
  const expectedHash = findSha256ForAsset(sumsText, assetName)
  if (!expectedHash)
    throw new Error(
      `[updateService] ${SUMS_FILE_NAME} has no checksum for ${assetName} — refusing to install the update`,
    )

  const actualHash = (await ApkInstaller.computeSha256(zipUri)).toLowerCase()
  if (actualHash !== expectedHash)
    throw new Error(
      `[updateService] SHA-256 mismatch for ${assetName}: expected ${expectedHash}, got ${actualHash}`,
    )
}
