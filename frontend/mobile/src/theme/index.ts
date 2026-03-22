import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';
import { DefaultTheme as NavigationLightTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

// Brand Colors
const brandColors = {
  primary: '#8b5cf6',      // Violet 500
  primaryDark: '#7c3aed',    // Violet 600
  primaryLight: '#a78bfa',   // Violet 400
  secondary: '#06b6d4',      // Cyan 500
  accent: '#f59e0b',         // Amber 500
  success: '#10b981',        // Emerald 500
  warning: '#f59e0b',        // Amber 500
  error: '#ef4444',          // Red 500
  info: '#3b82f6',           // Blue 500
};

// Light Theme
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.primary,
    primaryContainer: '#ede9fe',
    secondary: brandColors.secondary,
    secondaryContainer: '#cffafe',
    tertiary: brandColors.accent,
    tertiaryContainer: '#fef3c7',
    surface: '#ffffff',
    surfaceVariant: '#f1f5f9',
    background: '#f8fafc',
    error: brandColors.error,
    errorContainer: '#fee2e2',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#4c1d95',
    onSecondary: '#ffffff',
    onSecondaryContainer: '#164e63',
    onSurface: '#0f172a',
    onSurfaceVariant: '#64748b',
    outline: '#cbd5e1',
    outlineVariant: '#e2e8f0',
    inverseSurface: '#1e293b',
    inverseOnSurface: '#f1f5f9',
    inversePrimary: '#ddd6fe',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0,0,0,0.5)',
  },
};

// Dark Theme
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#a78bfa',
    primaryContainer: '#5b21b6',
    secondary: '#22d3ee',
    secondaryContainer: '#155e75',
    tertiary: '#fbbf24',
    tertiaryContainer: '#92400e',
    surface: '#1e293b',
    surfaceVariant: '#334155',
    background: '#0f172a',
    error: '#f87171',
    errorContainer: '#991b1b',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#ede9fe',
    onSecondary: '#164e63',
    onSecondaryContainer: '#cffafe',
    onSurface: '#f1f5f9',
    onSurfaceVariant: '#94a3b8',
    outline: '#475569',
    outlineVariant: '#334155',
    inverseSurface: '#f1f5f9',
    inverseOnSurface: '#1e293b',
    inversePrimary: '#7c3aed',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0,0,0,0.5)',
  },
};

// Navigation Themes
export const navigationTheme = {
  light: {
    ...NavigationLightTheme,
    colors: {
      ...NavigationLightTheme.colors,
      primary: brandColors.primary,
      background: '#f8fafc',
      card: '#ffffff',
      text: '#0f172a',
      border: '#e2e8f0',
      notification: brandColors.primary,
    },
  },
  dark: {
    ...NavigationDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      primary: '#a78bfa',
      background: '#0f172a',
      card: '#1e293b',
      text: '#f1f5f9',
      border: '#334155',
      notification: '#a78bfa',
    },
  },
};

// Typography
export const typography = {
  display: {
    large: { fontSize: 57, lineHeight: 64, fontWeight: '400' },
    medium: { fontSize: 45, lineHeight: 52, fontWeight: '400' },
    small: { fontSize: 36, lineHeight: 44, fontWeight: '400' },
  },
  headline: {
    large: { fontSize: 32, lineHeight: 40, fontWeight: '400' },
    medium: { fontSize: 28, lineHeight: 36, fontWeight: '400' },
    small: { fontSize: 24, lineHeight: 32, fontWeight: '400' },
  },
  title: {
    large: { fontSize: 22, lineHeight: 28, fontWeight: '400' },
    medium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
    small: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  },
  body: {
    large: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    medium: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
    small: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  },
  label: {
    large: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
    medium: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
    small: { fontSize: 11, lineHeight: 16, fontWeight: '500' },
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Export complete theme object
export const theme = {
  light: lightTheme,
  dark: darkTheme,
  navigation: navigationTheme.light,
  colors: brandColors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default theme;
