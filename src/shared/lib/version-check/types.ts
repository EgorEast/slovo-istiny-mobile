export interface LatestReleaseInfo {
  body: string
  htmlUrl: string
  name: string
  publishedAt: string
  /** Download URL of the `SHA256SUMS.txt` asset; null/absent for legacy releases. */
  sha256SumsDownloadUrl?: null | string
  tagName: string
  version: string
  zipDownloadUrl: null | string
}
