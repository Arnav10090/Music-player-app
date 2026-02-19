export const LightColors = {
  primary: '#FF6B2C',
  primaryLight: '#FF8C5A',
  primaryDark: '#E05520',

  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',

  textPrimary: '#1A1A1A',
  textSecondary: '#888888',
  textTertiary: '#BBBBBB',
  textInverse: '#FFFFFF',

  border: '#EEEEEE',

  miniPlayerBg: '#FFFFFF',
  miniPlayerBorder: '#EEEEEE',

  seekBarFilled: '#FF6B2C',
  seekBarEmpty: '#EEEEEE',
  seekBarThumb: '#FF6B2C',

  tabBarBg: '#FFFFFF',
  tabBarBorder: '#EEEEEE',

  cardBg: '#FFFFFF',
  sheetBg: '#FFFFFF',
  modalBackdrop: 'rgba(0,0,0,0.45)',

  error: '#E53E3E',
};

export const DarkColors = {
  primary: '#FF6B2C',
  primaryLight: '#FF8C5A',
  primaryDark: '#E05520',

  background: '#1C1C1E',
  backgroundSecondary: '#2C2C2E',

  textPrimary: '#FFFFFF',
  textSecondary: '#ABABAB',
  textTertiary: '#6B6B6B',
  textInverse: '#FFFFFF',

  border: '#3A3A3C',

  miniPlayerBg: '#2C2C2E',
  miniPlayerBorder: '#3A3A3C',

  seekBarFilled: '#FF6B2C',
  seekBarEmpty: '#3A3A3C',
  seekBarThumb: '#FF6B2C',

  tabBarBg: '#1C1C1E',
  tabBarBorder: '#3A3A3C',

  cardBg: '#2C2C2E',
  sheetBg: '#2C2C2E',
  modalBackdrop: 'rgba(0,0,0,0.7)',

  error: '#FF6B6B',
};

// Keep for legacy imports that haven't migrated yet
export const Colors = LightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  display: 30,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const MiniPlayerHeight = 64;
export const BottomTabHeight = 64;