import React, { useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  setTheme,
  updateSystemTheme,
  Theme,
} from "../../store/slices/themeSlice";
import { Button } from "./Button";

const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { theme, isDark } = useAppSelector((state) => state.theme);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      dispatch(updateSystemTheme());
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    dispatch(setTheme(theme));

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [dispatch, theme]);

  const themes: {
    value: Theme;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      value: "light",
      label: t("theme.light"),
      icon: (
        <Sun
          size={16}
          className="transition-transform duration-200 hover:rotate-12"
        />
      ),
      description: "Light mode",
    },
    {
      value: "dark",
      label: t("theme.dark"),
      icon: (
        <Moon
          size={16}
          className="transition-transform duration-200 hover:-rotate-12"
        />
      ),
      description: "Dark mode",
    },
    {
      value: "system",
      label: t("theme.system"),
      icon: (
        <Monitor
          size={16}
          className="transition-transform duration-200 hover:scale-110"
        />
      ),
      description: "Follow system preference",
    },
  ];

  const currentTheme = themes.find((t) => t.value === theme);

  const handleThemeChange = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    document.documentElement.classList.add("theme-transition");

    dispatch(setTheme(nextTheme.value));

    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 300);
  };

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleThemeChange}
        title={`${t("theme.toggleTheme")} - ${currentTheme?.description}`}
        className={`
          relative overflow-hidden transition-all duration-200
          hover:bg-theme-secondary active:scale-95 focus-outline
          ${isDark ? "hover:bg-opacity-20" : "hover:bg-opacity-10"}
          group-hover:shadow-sm
        `}
        leftIcon={
          <span className="relative z-10 flex items-center justify-center">
            {currentTheme?.icon}
          </span>
        }
      >
        <span className="hidden sm:inline relative z-10 font-medium">
          {currentTheme?.label}
        </span>

        <div
          className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200
          ${
            isDark
              ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10"
              : "bg-gradient-to-r from-blue-500/5 to-purple-500/5"
          }
        `}
        />
      </Button>
    </div>
  );
};

export default ThemeToggle;
