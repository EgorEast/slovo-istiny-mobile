import { getLocalAppIconUri, hasUriProtocol } from 'shared/lib/app-icon'
import { type LockScreenMetadata } from '../types'

type MetadataPayload = { artworkUrl?: string } & Omit<LockScreenMetadata, 'artworkUrl'>

/**
 * Готовит payload метаданных lock screen, подставляя фолбэк-иконку приложения
 * вместо отсутствующего/невалидного артворка: в натив уходит только значение с
 * протоколом (`hasUriProtocol`), иначе ключ `artworkUrl` полностью опускается.
 * @param metadata - Метаданные трека для lock screen.
 */
export const prepareMetadataPayload = (metadata: LockScreenMetadata): MetadataPayload => {
  const artworkUrl = [metadata.artworkUrl, getLocalAppIconUri()].find(hasUriProtocol)
  const { artworkUrl: _ignored, ...metadataWithoutArtwork } = metadata

  return { ...metadataWithoutArtwork, ...(artworkUrl ? { artworkUrl } : {}) }
}
