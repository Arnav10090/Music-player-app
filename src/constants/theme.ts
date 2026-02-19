export const Colors = {
  // Primary orange accent from Figma
  primary: '#FF6B2C',
  primaryLight: '#FF8C5A',
  primaryDark: '#E05520',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundDark: '#1A1A1A',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#888888',
  textTertiary: '#BBBBBB',
  textInverse: '#FFFFFF',

  // Borders
  border: '#EEEEEE',
  borderDark: '#333333',

  // Mini player background
  miniPlayerBg: '#FFFFFF',
  miniPlayerBorder: '#EEEEEE',

  // Seek bar
  seekBarFilled: '#FF6B2C',
  seekBarEmpty: '#EEEEEE',
  seekBarThumb: '#FF6B2C',

  // Status
  error: '#E53E3E',
};

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