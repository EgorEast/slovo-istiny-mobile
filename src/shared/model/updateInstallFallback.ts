import { type Ctx } from '@reatom/framework'
import { downloadUpdateZip } from '../lib/update-service/updateService'
import { compareVersions } from '../lib/version-check/compareVersions'
import { fetchLatestRelease } from '../lib/version-check/fetchLatestRelease'
import { type LatestReleaseInfo } from '../lib/version-check/types'
import { latestVersionAtom, releaseUrlAtom, sha256SumsUrlAtom, zipDownloadUrlAtom } from './update'
import { updateProgressAtom } from './updateInstall'

export const getFallbackDownloadUrl = (
  failedUrl: string,
  failedVersion: null | string,
  release: LatestReleaseInfo | null,
): null | string => {
  if (!release) return null
  if (failedVersion && compareVersions(release.version, failedVersion) < 0) return null
  const fallbackUrl = release.zipDownloadUrl
  if (!fallbackUrl || fallbackUrl === failedUrl) return null
  return fallbackUrl
}

export const downloadUpdateZipWithFallback = async (
  ctx: Ctx,
  zipDownloadUrl: string,
): Promise<string> => {
  const sumsDownloadUrl = ctx.get(sha256SumsUrlAtom)
  try {
    return await downloadUpdateZip(
      zipDownloadUrl,
      percent => {
        ctx.schedule(() => updateProgressAtom(ctx, percent))
      },
      undefined,
      { sha256SumsDownloadUrl: sumsDownloadUrl },
    )
  } catch (downloadError) {
    const failedVersion = ctx.get(latestVersionAtom)
    const release = await fetchLatestRelease()
    const fallbackUrl = getFallbackDownloadUrl(zipDownloadUrl, failedVersion, release)
    if (!fallbackUrl || !release) throw downloadError

    const fallbackSumsUrl = release.sha256SumsDownloadUrl ?? null
    await ctx.schedule(() => {
      updateProgressAtom(ctx, 0)
      latestVersionAtom(ctx, release.version)
      releaseUrlAtom(ctx, release.htmlUrl)
      sha256SumsUrlAtom(ctx, fallbackSumsUrl)
      zipDownloadUrlAtom(ctx, release.zipDownloadUrl)
    })

    try {
      return await downloadUpdateZip(
        fallbackUrl,
        percent => {
          ctx.schedule(() => updateProgressAtom(ctx, percent))
        },
        undefined,
        { sha256SumsDownloadUrl: fallbackSumsUrl },
      )
    } catch {
      throw downloadError
    }
  }
}
