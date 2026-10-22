import { type TextStyle } from 'react-native'
import { getHaloRgbaColor, HALO_BLUR_RADIUS } from './halo'

// Halo for titles drawn straight on artwork: an inverse-tone shadow (white
// under dark text, black under light text) with zero offset and a large blur
// radius. React-native-web deprecates the per-prop text shadow in favor of the
// CSS shorthand, so web uses the shorthand with the same geometry.
export const getTitleTextShadow = (textColor: string): { textShadow: string } & TextStyle => ({
  textShadow: `0 0 ${HALO_BLUR_RADIUS}px ${getHaloRgbaColor(textColor)}`,
})
