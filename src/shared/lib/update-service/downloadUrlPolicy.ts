export const ALLOWED_UPDATE_HOSTS = [
  'git.lightnode.ru',
  'codeberg.org',
  'github.com',
  'objects.githubusercontent.com',
] as const

const ALLOWED_HOST_SET: ReadonlySet<string> = new Set(ALLOWED_UPDATE_HOSTS)

const parseUpdateUrl = (url: string): URL => {
  try {
    return new URL(url)
  } catch {
    throw new Error(`[updateService] Invalid update download URL: ${url}`)
  }
}

export const assertAllowedUpdateUrl = (url: string): void => {
  const parsed = parseUpdateUrl(url)
  if (parsed.protocol !== 'https:')
    throw new Error(`[updateService] Update download URL must use https, got: ${url}`)
  if (!ALLOWED_HOST_SET.has(parsed.hostname))
    throw new Error(`[updateService] Update download host is not allowed: ${parsed.hostname}`)
}
