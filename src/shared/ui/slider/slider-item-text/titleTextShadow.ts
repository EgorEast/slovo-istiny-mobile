import { type TextStyle } from 'react-native'
import { withAlpha } from '../../theme/withAlpha'
import { isLightColor } from './isLightColor'

// Halo for titles drawn straight on artwork: an inverse-tone shadow (white
// under dark text, black under light text) with zero offset and a large blur
// radius. The blur stays unnoticeable — it only keeps the title readable over
// artwork of a similar tone, without looking like a shadow.
export const getTitleTextShadow = (textColor: string): TextStyle => ({
  textShadowColor: withAlpha(isLightColor(textColor) ? '#000' : '#fff', 0.7),
  textShadowOffset: { height: 0, width: 0 },
  textShadowRadius: 10,
})
