import React, { useState, useEffect, useRef, useCallback } from "react";
import { clsx } from "clsx";
import { Search, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLazySearchSymbolsQuery } from "../../store/api/stockApi";
import { SymbolSuggestion } from "../../store/api/models";

interface StockSymbolInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "filled";
  onSymbolSelect?: (symbol: SymbolSuggestion) => void;
}

const StockSymbolInput: React.FC<StockSymbolInputProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  variant = "default",
  onSymbolSelect,
  className,
  id,
  disabled,
  placeholder,
  ...props
}) => {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<SymbolSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const [searchSymbols, { isLoading, error: searchError }] =
    useLazySearchSymbolsQuery();

  const inputId =
    id || `stock-symbol-input-${Math.random().toString(36).substr(2, 9)}`;

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (query.trim().length === 0) {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      debounceRef.current = setTimeout(async () => {
        try {
          const result = await searchSymbols({ q: query, limit: 10 }).unwrap();
          setSuggestions(result);
          setShowSuggestions(result.length > 0);
          setSelectedIndex(-1);
        } catch (err) {
          console.error("Symbol search failed:", err);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [searchSymbols],
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.toUpperCase();
    onChange(inputValue);
    debouncedSearch(inputValue);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: SymbolSuggestion) => {
    onChange(suggestion.symbol);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setIsSearching(false);

    if (onSymbolSelect) {
      onSymbolSelect(suggestion);
    }

    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;

      case "Escape":
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setIsSearching(false);
        break;
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (suggestions.length > 0 && value.trim()) {
      setShowSuggestions(true);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Styling
  const baseStyles =
    "w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200";

  const variantStyles = {
    default: "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
    filled: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  };

  const errorStyles = error ? "border-danger-500 focus:ring-danger-500" : "";
  const disabledStyles =
    "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed";

  const displayError =
    error || (searchError ? t("stockSymbolInput.searchError") : "");

  return (
    <div className="w-full relative">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder || t("stockSymbolInput.placeholder")}
          disabled={disabled}
          className={clsx(
            baseStyles,
            variantStyles[variant],
            errorStyles,
            disabledStyles,
            "pl-10",
            (isLoading || isSearching) && "pr-10",
            className,
          )}
          autoComplete="off"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-controls={showSuggestions ? `${inputId}-suggestions` : undefined}
          aria-owns={showSuggestions ? `${inputId}-suggestions` : undefined}
          role="combobox"
          {...props}
        />

        {(isLoading || isSearching) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 className="w-4 h-4 text-gray-400 dark:text-gray-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id={`${inputId}-suggestions`}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.symbol}
              className={clsx(
                "px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150",
                index === selectedIndex &&
                  "bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500",
              )}
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                      {suggestion.symbol}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 text-sm truncate">
                      {suggestion.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-primary-600 dark:text-primary-400">
                      {suggestion.exchange}
                    </span>
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        suggestion.asset_type === "Stock"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                      )}
                    >
                      {suggestion.asset_type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {displayError && (
        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
          {displayError}
        </p>
      )}

      {/* Helper text */}
      {helperText && !displayError && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default StockSymbolInput;
