import { useThemeStore } from '../store/themeStore';
import { LightColors, DarkColors } from '../constants/theme';

/**
 * useThemeColors
 * Returns the correct color palette for the current theme.
 * Drop-in replacement for importing Colors directly:
 *
 *   // Before:
 *   import { Colors } from '../constants/theme';
 *
 *   // After (inside component):
 *   const Colors = useThemeColors();
 */
export function useThemeColors() {
  const isDark = useThemeStore((s) => s.isDark);
  return isDark ? DarkColors : LightColors;
}