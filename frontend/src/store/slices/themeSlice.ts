import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  isInitialized: boolean;
  systemPreference: boolean;
}

const THEME_STORAGE_KEY = "stock-tracker-theme";
const VALID_THEMES: Theme[] = ["light", "dark", "system"];

const getSystemTheme = (): boolean => {
  if (typeof window !== "undefined" && window.matchMedia) {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (error) {
      console.warn("Error detecting system theme:", error);
      return false;
    }
  }
  return false;
};

const getStoredTheme = (): Theme => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      if (stored && VALID_THEMES.includes(stored)) {
        return stored;
      }
    } catch (error) {
      console.warn("Error reading theme from localStorage:", error);
    }
  }
  return "system";
};

const storeTheme = (theme: Theme): void => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn("Error storing theme to localStorage:", error);
    }
  }
};

const calculateIsDark = (theme: Theme, systemPreference?: boolean): boolean => {
  if (theme === "system") {
    return systemPreference !== undefined ? systemPreference : getSystemTheme();
  }
  return theme === "dark";
};

const applyThemeToDocument = (isDark: boolean): void => {
  if (typeof window !== "undefined" && document.documentElement) {
    try {
      const root = document.documentElement;

      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", isDark ? "#1f2937" : "#ffffff");
      }
    } catch (error) {
      console.warn("Error applying theme to document:", error);
    }
  }
};

const initialSystemPreference = getSystemTheme();
const initialTheme = getStoredTheme();

const initialState: ThemeState = {
  theme: initialTheme,
  isDark: calculateIsDark(initialTheme, initialSystemPreference),
  isInitialized: false,
  systemPreference: initialSystemPreference,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    initializeTheme: (state) => {
      if (!state.isInitialized) {
        state.systemPreference = getSystemTheme();
        state.isDark = calculateIsDark(state.theme, state.systemPreference);
        state.isInitialized = true;

        // Apply theme to document
        applyThemeToDocument(state.isDark);
      }
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      const newTheme = action.payload;

      if (VALID_THEMES.includes(newTheme)) {
        state.theme = newTheme;
        state.isDark = calculateIsDark(newTheme, state.systemPreference);

        // Store theme preference
        storeTheme(newTheme);

        // Apply theme to document
        applyThemeToDocument(state.isDark);
      }
    },
    updateSystemTheme: (state) => {
      const newSystemPreference = getSystemTheme();
      state.systemPreference = newSystemPreference;

      if (state.theme === "system") {
        const newIsDark = calculateIsDark("system", newSystemPreference);
        if (state.isDark !== newIsDark) {
          state.isDark = newIsDark;
          applyThemeToDocument(state.isDark);
        }
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.isDark ? "light" : "dark";
      state.theme = newTheme;
      state.isDark = calculateIsDark(newTheme, state.systemPreference);

      storeTheme(newTheme);
      applyThemeToDocument(state.isDark);
    },
    resetTheme: (state) => {
      state.theme = "system";
      state.isDark = calculateIsDark("system", state.systemPreference);
      state.isInitialized = true;

      storeTheme("system");
      applyThemeToDocument(state.isDark);
    },
  },
});

export const {
  initializeTheme,
  setTheme,
  updateSystemTheme,
  toggleTheme,
  resetTheme,
} = themeSlice.actions;

export default themeSlice.reducer;
