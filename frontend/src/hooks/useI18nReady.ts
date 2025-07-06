import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export interface UseI18nReadyReturn {
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to track when i18n localization files are ready
 * This helps prevent layout shifts and provides better UX during loading
 */
export const useI18nReady = (): UseI18nReadyReturn => {
  const { i18n, ready } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if i18n is already ready
    if (ready && i18n.isInitialized) {
      setIsLoading(false);
      setError(null);
      return;
    }

    // Set up loading state
    setIsLoading(true);
    setError(null);

    // Handler for when i18n is ready
    const handleI18nReady = () => {
      setIsLoading(false);
      setError(null);
    };

    // Handler for i18n errors
    const handleI18nError = (error: Error) => {
      setIsLoading(false);
      setError(error);
    };

    // Listen for i18n events
    i18n.on("initialized", handleI18nReady);
    i18n.on("loaded", handleI18nReady);
    i18n.on("failedLoading", handleI18nError);

    // Check if already initialized but ready flag hasn't updated
    if (i18n.isInitialized && i18n.hasLoadedNamespace("translation")) {
      handleI18nReady();
    }

    // Cleanup event listeners
    return () => {
      i18n.off("initialized", handleI18nReady);
      i18n.off("loaded", handleI18nReady);
      i18n.off("failedLoading", handleI18nError);
    };
  }, [i18n, ready]);

  // Additional check for language changes
  useEffect(() => {
    if (!ready) return;

    const handleLanguageChanged = (lng: string) => {
      // When language changes, we might need to load new resources
      setIsLoading(true);

      // Check if the new language resources are already loaded
      if (i18n.hasLoadedNamespace("translation", {lng})) {
        setIsLoading(false);
      } else {
        // Wait for the new language to load
        const checkLoaded = () => {
          if (i18n.hasLoadedNamespace("translation", {lng})) {
            setIsLoading(false);
            i18n.off("loaded", checkLoaded);
          }
        };
        i18n.on("loaded", checkLoaded);
      }
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n, ready]);

  return {
    isReady: ready && i18n.isInitialized && !isLoading,
    isLoading,
    error,
  };
};

export default useI18nReady;
