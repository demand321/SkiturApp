export const LIGHT_COLORS = {
  primary: '#1B6DB2',
  primaryLight: '#E6F4FE',
  secondary: '#2E7D5B',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',
} as const;

export const DARK_COLORS = {
  primary: '#4A9FE5',
  primaryLight: '#1A3A5C',
  secondary: '#3DA878',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#E5E5E5',
  textSecondary: '#9CA3AF',
  border: '#2D2D2D',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#FBBF24',
} as const;

/** @deprecated Use useTheme() hook instead. Kept for backward compatibility. */
export const COLORS = LIGHT_COLORS;

export const TRACKING = {
  intervalMs: 5000,
  syncIntervalMs: 30000,
  lowBatteryIntervalMs: 30000,
} as const;

export const WEATHER = {
  userAgent: 'SkiturApp/1.0 github.com/knsorensen/SkiturApp',
  baseUrl: 'https://api.met.no/weatherapi/locationforecast/2.0/',
  refreshIntervalMs: 3600000, // 1 hour
} as const;
