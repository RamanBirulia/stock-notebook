import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import { addNotification, removeNotification, setLoading, clearGlobalError } from './slices/uiSlice';
import { setTheme } from './slices/themeSlice';
import type { Theme } from './slices/themeSlice';
import type { Notification } from './slices/uiSlice';

// Notification hooks
export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);

  const showNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp'>) => {
      dispatch(addNotification(notification));
    },
    [dispatch]
  );

  const hideNotification = useCallback(
    (id: string) => {
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showNotification({ type: 'success', title, message });
    },
    [showNotification]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showNotification({ type: 'error', title, message, duration: 8000 });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showNotification({ type: 'warning', title, message });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showNotification({ type: 'info', title, message });
    },
    [showNotification]
  );

  return {
    notifications,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

// Theme hooks
export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { theme, isDark } = useAppSelector((state) => state.theme);

  const changeTheme = useCallback(
    (newTheme: Theme) => {
      dispatch(setTheme(newTheme));
    },
    [dispatch]
  );

  const toggleTheme = useCallback(() => {
    const newTheme = isDark ? 'light' : 'dark';
    changeTheme(newTheme);
  }, [isDark, changeTheme]);

  return {
    theme,
    isDark,
    changeTheme,
    toggleTheme,
  };
};

// Loading state hooks
export const useLoading = () => {
  const dispatch = useAppDispatch();
  const { isLoading, loadingMessage } = useAppSelector((state) => state.ui);

  const setLoadingState = useCallback(
    (loading: boolean, message?: string) => {
      if (loading && message) {
        dispatch(setLoading(true));
      } else {
        dispatch(setLoading(loading));
      }
    },
    [dispatch]
  );

  return {
    isLoading,
    loadingMessage,
    setLoading: setLoadingState,
  };
};

// UI state hooks
export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.ui);

  const clearError = useCallback(() => {
    dispatch(clearGlobalError());
  }, [dispatch]);

  return {
    ...ui,
    clearError,
  };
};

// Combined hooks for common patterns
export const useStockOperations = () => {
  const { showSuccess, showError } = useNotifications();
  const { setLoading } = useLoading();

  const handleStockOperation = useCallback(
    async (operation: () => Promise<any>, successMessage: string) => {
      try {
        setLoading(true, 'Processing...');
        await operation();
        showSuccess('Success', successMessage);
      } catch (error: any) {
        const message = error?.data?.error || error?.message || 'Operation failed';
        showError('Error', message);
        throw error; // Re-throw for component handling if needed
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showSuccess, showError]
  );

  return {
    handleStockOperation,
  };
};

// Hook for managing form states with Redux
export const useFormWithRedux = <T extends Record<string, any>>(initialState: T) => {
  const { showError } = useNotifications();
  const { setLoading } = useLoading();

  const handleSubmit = useCallback(
    async (
      data: T,
      submitFn: (data: T) => Promise<any>,
      options?: {
        successMessage?: string;
        loadingMessage?: string;
        onSuccess?: (result: any) => void;
        onError?: (error: any) => void;
      }
    ) => {
      try {
        setLoading(true, options?.loadingMessage || 'Submitting...');
        const result = await submitFn(data);
        options?.onSuccess?.(result);
        return result;
      } catch (error: any) {
        const message = error?.data?.error || error?.message || 'Submission failed';
        showError('Submission Error', message);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showError]
  );

  return {
    handleSubmit,
  };
};

// Hook for handling API errors consistently
export const useApiErrorHandler = () => {
  const { showError } = useNotifications();

  const handleApiError = useCallback(
    (error: any, context?: string) => {
      const message = error?.data?.error || error?.message || 'An unexpected error occurred';
      const title = context ? `${context} Error` : 'API Error';
      showError(title, message);
    },
    [showError]
  );

  return { handleApiError };
};

// Hook for debounced operations with Redux
export const useDebouncedOperation = () => {
  const { setLoading } = useLoading();

  const debouncedOperation = useCallback(
    (operation: () => Promise<any>, delay: number = 300) => {
      let timeoutId: NodeJS.Timeout;
      
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        setLoading(true, 'Processing...');
        
        timeoutId = setTimeout(async () => {
          try {
            await operation();
          } finally {
            setLoading(false);
          }
        }, delay);
      };
    },
    [setLoading]
  );

  return { debouncedOperation };
};