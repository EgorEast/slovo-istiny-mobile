// Perceived-luminance check for concrete hex colors ('#rgb'/'#rrggbb').
// Unparseable values count as dark (halo goes white). Used to pick the
// inverse tone of the on-artwork title halo.
export const isLightColor = (color: string): boolean => {
  if (!color.startsWith('#')) return false

  const digits = color.slice(1)
  if (digits.length !== 3 && digits.length !== 6) return false

  const expanded =
    digits.length === 3
      ? digits
          .split('')
          .map(digit => digit + digit)
          .join('')
      : digits
  const channels = [0, 2, 4].map(index => parseInt(expanded.slice(index, index + 2), 16))

  if (channels.some(Number.isNaN)) return false

  const [red, green, blue] = channels
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255

  return luminance >= 0.6
}
