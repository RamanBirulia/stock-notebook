import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { useAppDispatch, useAppSelector } from "./store";
import { initializeTheme, updateSystemTheme } from "./store/slices/themeSlice";
import { setMobile } from "./store/slices/uiSlice";
import { selectIsAuthenticated } from "./store/slices/authSlice";
import Layout from "./components/layout/Layout";
import {
  Dashboard,
  AddPurchase,
  StockDetails,
  Login,
  LandingPage,
} from "./pages";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import "./i18n";
import "./index.css";

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

// Router content component (inside Router context)
const RouterContent: React.FC = () => {
  useScrollToTop();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <Routes>
      {/* Legal pages - always rendered without layout */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />

      {isAuthenticated ? (
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/add-purchase" element={<AddPurchase />} />
                <Route path="/stock/:symbol" element={<StockDetails />} />
                <Route path="/login" element={<Login />} />
                {/* Redirect any other route to dashboard when authenticated */}
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </Layout>
          }
        />
      ) : (
        <>
          <Route path="/login" element={<Login />} />
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
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
