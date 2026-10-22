import { isLightColor } from './isLightColor'

// Halo for titles drawn straight on artwork: an inverse-tone shadow (white
// under dark text, black under light text) with zero offset and a large blur
// radius. Shared by the native and web twins, which cannot import each other.
export const HALO_BLUR_RADIUS = 10
export const HALO_ALPHA = 0.7

// Inverse-tone halo: white under dark text, black under light text.
export const getHaloColor = (textColor: string): '#000' | '#fff' =>
  isLightColor(textColor) ? '#000' : '#fff'

const HALO_RGB: Record<ReturnType<typeof getHaloColor>, string> = {
  '#000': '0, 0, 0',
  '#fff': '255, 255, 255',
}

// Same halo as an rgba() string, for the web CSS text-shadow shorthand.
export const getHaloRgbaColor = (textColor: string): string =>
  `rgba(${HALO_RGB[getHaloColor(textColor)]}, ${HALO_ALPHA})`
