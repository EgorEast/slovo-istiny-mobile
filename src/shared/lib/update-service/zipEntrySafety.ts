const PATH_SEPARATORS = /[\\/]/
const UNSAFE_SEGMENT = '..'

export const assertSafeZipEntryPath = (entryPath: string): void => {
  const hasTraversalSegment = entryPath.split(PATH_SEPARATORS).includes(UNSAFE_SEGMENT)
  if (entryPath.startsWith('/') || entryPath.startsWith('\\') || hasTraversalSegment)
    throw new Error(`[updateService] Unsafe path in update archive: ${entryPath}`)
}
