import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { store } from "./store";
import { useAppDispatch, useAppSelector } from "./store";
import { initializeTheme, updateSystemTheme } from "./store/slices/themeSlice";
import { setMobile } from "./store/slices/uiSlice";
import { selectIsAuthenticated } from "./store/slices/authSlice";
import Layout from "./components/layout/Layout";
import ErrorBoundary from "./components/errors/ErrorBoundary";
import { useI18nReady } from "./hooks/useI18nReady";

import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/legal/TermsOfServicePage";
import NotFoundPage from "./pages/errors/NotFoundPage";
import "./i18n";
import "./index.css";
import { SkeletonDashboardHeader } from "./components/ui/loading/SkeletonHeader";
import { SkeletonDashboard } from "./components/ui/loading/Skeleton";
import DashboardPage from "./pages/DashboardPage";
import AddPurchasePage from "./pages/AddPurchasePage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";

// Enhanced theme effect hook with proper initialization
const useThemeEffect = () => {
  const dispatch = useAppDispatch();
  const { isDark, isInitialized } = useAppSelector((state) => state.theme);

  useEffect(() => {
    // Initialize theme system on app start
    dispatch(initializeTheme());
  }, [dispatch]);

  useEffect(() => {
    // Listen for system theme changes only after initialization
    if (isInitialized) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        dispatch(updateSystemTheme());
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    // Add meta theme-color tag if it doesn't exist
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = isDark ? "#1f2937" : "#ffffff";
      document.getElementsByTagName("head")[0].appendChild(meta);
    }
  }, [isDark]);
};

// Mobile detection hook
const useMobileDetection = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      dispatch(setMobile(isMobile));
    };

    // Check initial state
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [dispatch]);
};

// Scroll to top hook for route changes
const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
};

function StockDetails() {
  return null;
}

// Router content component (inside Router context)
const RouterContent: React.FC = () => {
  useScrollToTop();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { isReady, isLoading } = useI18nReady();

  // Show loading state while i18n is initializing
  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <SkeletonDashboardHeader />
        <main className="min-h-screen max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
          <SkeletonDashboard />
        </main>
      </div>
    );
  }

  return (
    <Routes>
      {/* Legal pages - always rendered without layout */}
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />

      {isAuthenticated ? (
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/add-purchase" element={<AddPurchasePage />} />
                <Route path="/stock/:symbol" element={<StockDetails />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                {/* Redirect any other route to dashboard when authenticated */}
                <Route path="*" element={<DashboardPage />} />
              </Routes>
            </Layout>
          }
        />
      ) : (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<LandingPage />} />
        </>
      )}
    </Routes>
  );
};

// App content component (inside Redux provider)
const AppContent: React.FC = () => {
  useThemeEffect();
  useMobileDetection();

  return (
    <div className="min-h-screen bg-theme text-theme transition-colors duration-300">
      <Router>
        <RouterContent />
      </Router>
    </div>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Provider store={store}>
          <AppContent />
        </Provider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
