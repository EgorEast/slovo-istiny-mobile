const yieldToEventLoop = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

/**
 * Maps items through an async mapper in bounded chunks, yielding to the event
 * loop between chunks. The mapper's synchronous part runs for the whole chunk
 * before the next yield, so a mapper that blocks on a native file-system check
 * no longer stalls the thread for every item in a single tick.
 * @param items - Items to map.
 * @param mapper - Async mapper applied per item.
 * @param chunkSize - Items processed per tick before yielding.
 */
export const mapWithYields = async <T, R>(
  items: readonly T[],
  mapper: (item: T) => Promise<R>,
  chunkSize = 20,
): Promise<R[]> => {
  const results: R[] = []

  for (let start = 0; start < items.length; start += chunkSize) {
    const chunk = items.slice(start, start + chunkSize)
    results.push(...(await Promise.all(chunk.map(mapper))))

    if (start + chunkSize < items.length) await yieldToEventLoop()
  }

  return results
}
