import { useEffect } from 'react';
import { useAppDispatch } from '../store';
import { setMobile } from '../store/slices/uiSlice';

/**
 * Hook for detecting mobile viewport and updating UI state
 * This hook monitors window resize events and updates the mobile state in Redux
 */
export const useMobileDetection = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      dispatch(setMobile(isMobile));
    };

    // Check initial state
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [dispatch]);
};

export default useMobileDetection;
