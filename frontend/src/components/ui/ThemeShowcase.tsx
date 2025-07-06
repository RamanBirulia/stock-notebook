import React from "react";
import { Sun, Moon, Monitor, Palette, Zap, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "./Button";
import { Card } from "./Card";

interface ThemePreviewProps {
  theme: "light" | "dark" | "system";
  isActive: boolean;
  onClick: () => void;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  isActive,
  onClick,
}) => {
  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun size={16} className="text-yellow-500" />;
      case "dark":
        return <Moon size={16} className="text-blue-400" />;
      case "system":
        return <Monitor size={16} className="text-purple-500" />;
    }
  };

  const getThemeColors = () => {
    switch (theme) {
      case "light":
        return {
          bg: "bg-white",
          border: "border-gray-200",
          text: "text-gray-900",
          accent: "bg-yellow-500",
        };
      case "dark":
        return {
          bg: "bg-gray-900",
          border: "border-gray-700",
          text: "text-white",
          accent: "bg-blue-500",
        };
      case "system":
        return {
          bg: "bg-linear-to-br from-purple-50 to-blue-50",
          border: "border-purple-200",
          text: "text-purple-900",
          accent: "bg-purple-500",
        };
    }
  };

  const colors = getThemeColors();

  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200
        ${colors.bg} ${colors.border} ${colors.text}
        ${isActive ? "ring-2 ring-primary-500 ring-offset-2" : "hover:shadow-md"}
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
      `}
    >
      {/* Theme indicator */}
      <div className="flex items-center gap-2 mb-3">
        {getThemeIcon()}
        <span className="font-medium capitalize">{theme}</span>
        {isActive && (
          <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Mini preview */}
      <div className="space-y-2">
        <div className={`h-2 ${colors.accent} rounded-full w-3/4`} />
        <div
          className={`h-1 ${colors.text.includes("white") ? "bg-gray-600" : "bg-gray-300"} rounded w-1/2`}
        />
        <div
          className={`h-1 ${colors.text.includes("white") ? "bg-gray-700" : "bg-gray-200"} rounded w-full`}
        />
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
          <Eye size={8} className="text-white" />
        </div>
      )}
    </button>
  );
};

const ThemeShowcase: React.FC = () => {
  const { t } = useTranslation();
  const {
    theme,
    isDark,
    isLight,
    isSystem,
    systemPrefersDark,
    setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    cycleTheme,
    getThemeIcon,
    getThemeLabel,
  } = useTheme();

  const themeFeatures = [
    {
      icon: <Palette className="w-5 h-5" />,
      title: "Theme Variants",
      description: "Light, Dark, and System themes with smooth transitions",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Fast Switching",
      description: "Instant theme changes with CSS custom properties",
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "System Aware",
      description: "Automatically follows your system preferences",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-theme flex items-center justify-center gap-3">
          <Palette className="w-8 h-8 text-primary-500" />
          Theme System Showcase
        </h1>
        <p className="text-theme-secondary text-lg">
          Experience seamless light and dark mode switching with our advanced
          theme system
        </p>
      </div>

      {/* Current Status */}
      <Card className="bg-theme border-theme">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-theme">
            Current Theme Status
          </h2>
          <div className="flex items-center gap-2 text-theme-secondary">
            <span className="text-2xl">{getThemeIcon()}</span>
            <span className="font-medium">{getThemeLabel()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-theme-secondary rounded-lg p-3">
            <div className="font-medium text-theme mb-1">Active Theme</div>
            <div className="text-theme-secondary capitalize">{theme}</div>
          </div>
          <div className="bg-theme-secondary rounded-lg p-3">
            <div className="font-medium text-theme mb-1">Current Mode</div>
            <div className={`${isDark ? "text-blue-400" : "text-yellow-600"}`}>
              {isDark ? "Dark Mode" : "Light Mode"}
            </div>
          </div>
          <div className="bg-theme-secondary rounded-lg p-3">
            <div className="font-medium text-theme mb-1">System Preference</div>
            <div
              className={`${systemPrefersDark ? "text-blue-400" : "text-yellow-600"}`}
            >
              {systemPrefersDark ? "Dark" : "Light"}
            </div>
          </div>
        </div>
      </Card>

      {/* Theme Selection */}
      <Card className="bg-theme border-theme">
        <h2 className="text-xl font-semibold text-theme mb-6">
          Choose Your Theme
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ThemePreview
            theme="light"
            isActive={theme === "light"}
            onClick={setLightTheme}
          />
          <ThemePreview
            theme="dark"
            isActive={theme === "dark"}
            onClick={setDarkTheme}
          />
          <ThemePreview
            theme="system"
            isActive={theme === "system"}
            onClick={setSystemTheme}
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={toggleTheme}
            leftIcon={isDark ? <Sun size={16} /> : <Moon size={16} />}
          >
            Toggle to {isDark ? "Light" : "Dark"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={cycleTheme}
            leftIcon={<Palette size={16} />}
          >
            Cycle Themes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={setSystemTheme}
            leftIcon={<Monitor size={16} />}
          >
            Use System
          </Button>
        </div>
      </Card>

      {/* Features */}
      <Card className="bg-theme border-theme">
        <h2 className="text-xl font-semibold text-theme mb-6">
          Theme System Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themeFeatures.map((feature, index) => (
            <div key={index} className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-theme">{feature.title}</h3>
              <p className="text-sm text-theme-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card className="bg-theme border-theme">
        <h2 className="text-xl font-semibold text-theme mb-4">
          Keyboard Shortcuts
        </h2>
        <div className="bg-theme-secondary rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-theme-secondary">Cycle through themes</span>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-theme border border-theme-secondary rounded text-xs font-mono text-theme-secondary">
                Ctrl
              </kbd>
              <span className="text-theme-tertiary">+</span>
              <kbd className="px-2 py-1 bg-theme border border-theme-secondary rounded text-xs font-mono text-theme-secondary">
                Shift
              </kbd>
              <span className="text-theme-tertiary">+</span>
              <kbd className="px-2 py-1 bg-theme border border-theme-secondary rounded text-xs font-mono text-theme-secondary">
                T
              </kbd>
            </div>
          </div>
        </div>
      </Card>

      {/* Demo Components */}
      <Card className="bg-theme border-theme">
        <h2 className="text-xl font-semibold text-theme mb-6">
          Theme-Aware Components
        </h2>
        <div className="space-y-6">
          {/* Buttons */}
          <div>
            <h3 className="font-medium text-theme mb-3">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Form Elements */}
          <div>
            <h3 className="font-medium text-theme mb-3">Form Elements</h3>
            <div className="space-y-3 max-w-md">
              <div>
                <label className="label">Sample Input</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Type something..."
                  defaultValue="Theme-aware input"
                />
              </div>
              <div>
                <label className="label">Select Option</label>
                <select className="input">
                  <option>Light Theme</option>
                  <option>Dark Theme</option>
                  <option>System Theme</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div>
            <h3 className="font-medium text-theme mb-3">Status Messages</h3>
            <div className="space-y-2">
              <div className="success-message">
                ✓ Success message with theme colors
              </div>
              <div className="error-message">
                ✗ Error message with theme colors
              </div>
              <div className="warning-message">
                ⚠ Warning message with theme colors
              </div>
              <div className="info-message">
                ℹ Info message with theme colors
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-theme-secondary">
        <p className="text-sm">
          Theme system powered by TailwindCSS v4 with CSS custom properties
        </p>
        <p className="text-xs mt-1">
          Try changing your system theme to see automatic updates!
        </p>
      </div>
    </div>
  );
};

export default ThemeShowcase;
