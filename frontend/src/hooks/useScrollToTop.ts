import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook for scrolling to top when route changes
 * This hook automatically scrolls to the top of the page when navigating between routes
 */
export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
};

export default useScrollToTop;
