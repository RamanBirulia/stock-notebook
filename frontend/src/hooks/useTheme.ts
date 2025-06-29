import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setTheme,
  updateSystemTheme,
  Theme,
} from '../store/slices/themeSlice';

export interface ThemeConfig {
  theme: Theme;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
  systemPrefersDark: boolean;
}

export interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLightTheme: () => void;
  setDarkTheme: () => void;
  setSystemTheme: () => void;
  cycleTheme: () => void;
}

export interface UseThemeReturn extends ThemeConfig, ThemeActions {
  applyTheme: (theme: Theme) => void;
  getThemeIcon: () => string;
  getThemeLabel: () => string;
}

/**
 * Enhanced theme hook with comprehensive theme management capabilities
 */
export const useTheme = (): UseThemeReturn => {
  const dispatch = useAppDispatch();
  const { theme, isDark } = useAppSelector((state) => state.theme);

  // Get system theme preference
  const getSystemPreference = useCallback((): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, []);

  const systemPrefersDark = getSystemPreference();

  // Apply theme to document
  const applyTheme = useCallback((themeToApply: Theme) => {
    const root = document.documentElement;
    const isDarkTheme = themeToApply === 'dark' ||
      (themeToApply === 'system' && systemPrefersDark);

    // Add transition class for smooth theme switching
    root.classList.add('theme-transition');

    // Apply theme class
    if (isDarkTheme) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        isDarkTheme ? '#1f2937' : '#ffffff'
      );
    }

    // Remove transition class after animation
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
  }, [systemPrefersDark]);

  // Theme actions
  const setThemeAction = useCallback((newTheme: Theme) => {
    dispatch(setTheme(newTheme));
    applyTheme(newTheme);
  }, [dispatch, applyTheme]);

  const toggleTheme = useCallback(() => {
    const newTheme = isDark ? 'light' : 'dark';
    setThemeAction(newTheme);
  }, [isDark, setThemeAction]);

  const setLightTheme = useCallback(() => {
    setThemeAction('light');
  }, [setThemeAction]);

  const setDarkTheme = useCallback(() => {
    setThemeAction('dark');
  }, [setThemeAction]);

  const setSystemTheme = useCallback(() => {
    setThemeAction('system');
  }, [setThemeAction]);

  const cycleTheme = useCallback(() => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeAction(themes[nextIndex]);
  }, [theme, setThemeAction]);

  // Utility functions
  const getThemeIcon = useCallback((): string => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '💻';
      default:
        return '☀️';
    }
  }, [theme]);

  const getThemeLabel = useCallback((): string => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = () => {
      dispatch(updateSystemTheme());
    };

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Apply initial theme
    applyTheme(theme);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [dispatch, theme, applyTheme]);

  // Update theme when theme state changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Keyboard shortcut for theme switching (Ctrl/Cmd + Shift + T)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === 't'
      ) {
        event.preventDefault();
        cycleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cycleTheme]);

  return {
    // Theme config
    theme,
    isDark,
    isLight: theme === 'light',
    isSystem: theme === 'system',
    systemPrefersDark,

    // Theme actions
    setTheme: setThemeAction,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    cycleTheme,

    // Utility functions
    applyTheme,
    getThemeIcon,
    getThemeLabel,
  };
};

/**
 * Hook for components that need to respond to theme changes
 */
export const useThemeEffect = (callback: (isDark: boolean) => void) => {
  const { isDark } = useTheme();

  useEffect(() => {
    callback(isDark);
  }, [isDark, callback]);
};

/**
 * Hook for getting theme-aware CSS classes
 */
export const useThemeClasses = () => {
  const { isDark, theme } = useTheme();

  return {
    // Base classes
    bg: isDark ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
    bgTertiary: isDark ? 'bg-gray-700' : 'bg-gray-100',

    // Text classes
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDark ? 'text-gray-400' : 'text-gray-500',

    // Border classes
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    borderSecondary: isDark ? 'border-gray-600' : 'border-gray-300',

    // Theme-aware utility classes
    cardBg: 'bg-theme',
    cardBorder: 'border-theme',
    inputBg: 'bg-theme',
    inputBorder: 'border-theme',

    // Theme identifier
    theme,
    isDark,
  };
};

export default useTheme;
