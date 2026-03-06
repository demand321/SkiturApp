import { useColorScheme } from 'react-native';
import { LIGHT_COLORS, DARK_COLORS } from '../constants';
import { useThemeStore } from '../stores/themeStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((s) => s.preference);

  const resolvedScheme =
    preference === 'system' ? (systemScheme ?? 'light') : preference;

  const colors = resolvedScheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  return { colors, isDark: resolvedScheme === 'dark' };
}
