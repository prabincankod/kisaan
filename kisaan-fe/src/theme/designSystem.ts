export const colors = {
  surface: '#f8f9ff',
  surfaceDim: '#d0dbed',
  surfaceBright: '#f8f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainer: '#e6eeff',
  surfaceContainerHigh: '#dee9fc',
  surfaceContainerHighest: '#d9e3f6',

  onSurface: '#121c2a',
  onSurfaceVariant: '#404943',
  inverseSurface: '#27313f',
  inverseOnSurface: '#eaf1ff',

  outline: '#707973',
  outlineVariant: '#bfc9c1',
  surfaceTint: '#2c694e',

  primary: '#2d6a4f',
  onPrimary: '#ffffff',
  primaryContainer: '#b1f0ce',
  onPrimaryContainer: '#002114',
  inversePrimary: '#95d4b3',

  secondary: '#904d00',
  onSecondary: '#ffffff',
  secondaryContainer: '#ffdcc3',
  onSecondaryContainer: '#2f1500',

  tertiary: '#42493f',
  onTertiary: '#ffffff',
  tertiaryContainer: '#dee5d6',
  onTertiaryContainer: '#171d14',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  primaryFixed: '#b1f0ce',
  primaryFixedDim: '#95d4b3',
  onPrimaryFixed: '#002114',
  onPrimaryFixedVariant: '#0e5138',

  background: '#f8f9ff',
  onBackground: '#121c2a',
  surfaceVariant: '#d9e3f6',

  success: '#22c55e',
  successLight: '#dcfce7',
  warning: '#f59e0b',
  warningLight: '#fef3c7',

  border: '#bfc9c1',
  borderLight: '#f3f4f6',
  text: '#121c2a',
  textSecondary: '#404943',
  textTertiary: '#707973',
  textInverse: '#ffffff',

  shadow: '#000000',
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  containerMargin: 16,
  gutter: 12,
};

export const borderRadius = {
  sm: 4,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  display: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.02,
  },
  h1: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h2: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  labelMd: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  button: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
};