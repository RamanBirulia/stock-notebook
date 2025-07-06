import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { initializeTheme, updateSystemTheme } from '../store/slices/themeSlice';

/**
 * Hook for theme initialization and system theme change monitoring
 * This hook handles the initial theme setup and listens for system theme changes
 */
export const useThemeEffect = () => {
  const dispatch = useAppDispatch();
  const { isDark, isInitialized } = useAppSelector((state) => state.theme);

  // Initialize theme on first load
  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  // Listen for system theme changes
  useEffect(() => {
    if (isInitialized) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        dispatch(updateSystemTheme());
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [dispatch, isInitialized]);

  // Update meta theme-color tag
  useEffect(() => {
    // Add meta theme-color tag if it doesn't exist
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = isDark ? '#1f2937' : '#ffffff';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, [isDark]);
};

export default useThemeEffect;
