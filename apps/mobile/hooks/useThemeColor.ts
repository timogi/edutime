/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, themeForScheme } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const scheme = useColorScheme()
  const palette = themeForScheme(scheme)
  const colorFromProps = scheme === 'dark' ? props.dark : props.light

  if (colorFromProps) {
    return colorFromProps
  }
  return palette[colorName]
}
