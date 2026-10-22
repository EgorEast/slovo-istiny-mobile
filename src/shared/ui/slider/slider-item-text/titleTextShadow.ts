import { type TextStyle } from 'react-native'
import { withAlpha } from '../../theme/withAlpha'
import { getHaloColor, HALO_ALPHA, HALO_BLUR_RADIUS } from './halo'

// Halo for titles drawn straight on artwork: an inverse-tone shadow (white
// under dark text, black under light text) with zero offset and a large blur
// radius. The blur stays unnoticeable — it only keeps the title readable over
// artwork of a similar tone, without looking like a shadow.
export const getTitleTextShadow = (textColor: string): TextStyle => ({
  textShadowColor: withAlpha(getHaloColor(textColor), HALO_ALPHA),
  textShadowOffset: { height: 0, width: 0 },
  textShadowRadius: HALO_BLUR_RADIUS,
})
