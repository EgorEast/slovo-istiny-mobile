import { type ColorValue } from 'react-native'

/**
 * Narrows a React Native color to the string form icon fonts accept. Navigation
 * header options expose `ColorValue`, which also covers numeric and native color
 * values; icon props only take strings, so non-string values fall back.
 * @param color - Any color value coming from a navigation/component boundary.
 * @param fallback - Color to use when `color` is not a string.
 */
export const resolveColor = (
  color: ColorValue | undefined,
  fallback?: string,
): string | undefined => (typeof color === 'string' ? color : fallback)
