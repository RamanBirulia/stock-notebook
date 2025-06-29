# Stock Tracker Application Context

## Overview
A full-stack stock portfolio tracking application that allows users to record stock purchases and monitor their investment performance with real-time market data.

## MVP Idea
Client could add data: when he buy stock, price, amount, commision amount.
Dashboard should show: total spending amount, current backpack price and list of all stocks.
When one of stock pressed we should show chart (1 month, 1 year, 5 year options) with stock price data and point in time on chart when user purchaised this stock. Also the same data as on dashboard:
total spending per this stock, and current backpack price.

## Architecture

### Backend (Rust)
- **Framework**: Axum web framework with Tokio async runtime
- **Database**: SQLite with SQLx for database operations
- **Stock Data**: Alpha Vantage API for real-time stock prices and historical data
- **Key Dependencies**:
  - axum, tokio, sqlx, reqwest, serde, chrono, uuid, rust_decimal

### Frontend (React 19)
- **Framework**: React 19 with TypeScript
- **Styling**: TailwindCSS v4
- **State Management**: Redux Toolkit with RTK Query for API calls
- **Routing**: React Router DOM
- **Charts**: Chart.js with react-chartjs-2
- **Internationalization**: react-i18next
- **Theme**: Light/Dark mode support
- **Icons**: Lucide React

## Core Features

### 1. Stock Purchase Recording
- Users can add stock purchases with:
  - Stock symbol
  - Quantity of shares
  - Price per share at purchase
  - Commission/fees paid
  - Purchase date

### 2. Dashboard Overview
- **Total Portfolio Value**: Sum of all current stock values
- **Total Amount Invested**: Sum of all purchase costs + commissions
- **Profit/Loss**: Current value - total invested
- **Stock Holdings List**: All owned stocks with current prices and values

### 3. Individual Stock Details
- **Purchase History**: All purchases for a specific stock
- **Performance Metrics**: Total invested vs current value for the stock
- **Interactive Charts**: Historical price data with purchase points marked
- **Chart Periods**: 1 month, 1 year, 5 years view options

### 4. Real-time Market Data
- Integration with Alpha Vantage API for current stock prices
- Historical price data for charting
- Fallback to mock data when API limits are reached

### 5. Stock Symbol Autocomplete
- Real-time symbol search with company name suggestions
- Debounced search (300ms) to optimize API calls
- Keyboard navigation support (Arrow keys, Enter, Escape)
- Symbol validation and error handling
- Loading states and visual feedback
- Integration with existing UI components and theme system

## Data Models

### Purchase
- ID, symbol, quantity, price_per_share, commission, purchase_date

### Dashboard Data
- total_spent, current_value, profit_loss, profit_loss_percentage, stocks[]

### Stock Details
- symbol, purchases[], total_quantity, total_spent, current_price, current_value, profit_loss

### Chart Data
- symbol, period, price_data[], purchase_points[]

## API Endpoints
- `POST /api/purchases` - Create new stock purchase
- `GET /api/purchases` - Get all purchases
- `GET /api/dashboard` - Get dashboard summary data
- `GET /api/stock/:symbol` - Get detailed stock information
- `GET /api/stock/:symbol/chart?period=1M|1Y|5Y` - Get chart data
- `GET /api/symbols/search?q=query&limit=10` - Search stock symbols with autocomplete

## Database Schema
- **purchases** table with indexes on symbol and purchase_date
- SQLite with migrations support

## Deployment Target
- Digital Ocean App Platform
- Backend: Rust binary
- Frontend: Static React build
- Database: SQLite file storage

## Current Status
- Backend: Fully implemented with all API endpoints including stock symbol search
- Frontend: Redux store fully configured with RTK Query, theme management, and UI state
- Database: Migration system set up
- Stock API: Alpha Vantage integration with fallback mock data and symbol autocomplete
- Redux Store: Complete with API slices, middleware, and custom hooks
- Internationalization: Complete i18n setup with English and Spanish support
- Theme System: Complete light/dark/system theme implementation with TailwindCSS v4
- Stock Symbol Autocomplete: Integrated autocomplete component with real-time search

## Redux Store Configuration (Completed)

### Store Structure
- **RTK Query API Slice**: Complete stock API integration with caching, polling, and error handling
- **Theme Slice**: Light/dark/system theme management with localStorage persistence
- **UI Slice**: Comprehensive UI state including notifications, modals, loading states, and mobile responsiveness
- **Custom Hooks**: Utility hooks for notifications, theme, loading, and form handling

### Key Features Implemented
- Type-safe API calls with automatic data transformation
- Optimistic updates for better UX
- Real-time data with configurable polling
- Global error handling with user notifications
- Theme persistence and system theme detection
- Mobile-responsive state management
- Comprehensive notification system

## Internationalization Setup (Completed)

### i18n Configuration
- **Supported Languages**: English (en) and Spanish (es)
- **Framework**: react-i18next with i18next-browser-languagedetector and i18next-http-backend
- **Translation Files**: External JSON files in `/public/locales/{lang}/translation.json`
- **Language Detection**: Automatic browser language detection with localStorage persistence
- **Fallback**: English as fallback language

### Translation Coverage
- Complete UI text coverage including navigation, dashboard, forms, errors, and notifications
- Context-aware translations with proper pluralization support
- Comprehensive error messages and validation text
- Currency and date formatting per locale

### Language Switching
- **LanguageSelector Component**: Dropdown component with visual language indicators
- **Real-time Switching**: Instant language switching without page reload
- **Persistence**: Selected language saved to localStorage
- **Accessibility**: Proper ARIA labels and keyboard navigation support

### Files Added/Modified
- `frontend/src/store/api/stockApi.ts` - Complete RTK Query API slice with symbol search
- `frontend/src/store/slices/themeSlice.ts` - Theme management
- `frontend/src/store/slices/uiSlice.ts` - UI state management
- `frontend/src/store/hooks.ts` - Custom utility hooks
- `frontend/src/store/index.ts` - Enhanced store configuration
- `frontend/src/i18n/index.ts` - Complete internationalization configuration
- `frontend/public/locales/en/translation.json` - English translations with autocomplete support
- `frontend/public/locales/es/translation.json` - Spanish translations with autocomplete support
- `frontend/src/components/layout/LanguageSelector.tsx` - Language switcher component
- `frontend/src/components/layout/Header.tsx` - Updated with language selector
- `frontend/src/components/ui/ThemeToggle.tsx` - Updated with i18n support
- `frontend/src/components/ui/Button.tsx` - Enhanced with polymorphic 'as' prop
- `frontend/src/components/ui/StockSymbolInput.tsx` - **NEW: Stock symbol autocomplete component**
- `frontend/src/components/ui/StockSymbolInput.example.tsx` - **NEW: Usage examples**
- `frontend/src/pages/AddPurchase.tsx` - **UPDATED: Integrated autocomplete input**
- `frontend/src/App.tsx` - Main app component with providers
- `frontend/src/index.tsx` - App entry point
- `frontend/src/pages/StockDetails.tsx` - Complete stock details page
- `frontend/postcss.config.js` - PostCSS configuration for TailwindCSS
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/package.json` - Updated with compatible dependency versions and i18n checking scripts
- `frontend/scripts/check-i18n.js` - Comprehensive i18n key checking and management script
- `frontend/scripts/README.md` - Documentation for the i18n checking tool

## I18N Key Management (New Feature)

### Complete i18n Key Checking System
- **Automated Key Analysis**: Script scans all TypeScript/React files to identify used i18n keys
- **Missing Key Detection**: Identifies keys used in code but missing from translation files
- **Unused Key Management**: Finds translation keys no longer used in codebase
- **Automatic Deprecation**: Marks unused keys as deprecated with `__DEPRECATED__` prefix
- **Multi-language Support**: Analyzes all supported languages (English, Spanish)
- **Detailed Reporting**: Provides comprehensive reports with file references and statistics

### Available Scripts
- `npm run check-i18n` - Analyze current i18n key usage without making changes
- `npm run check-i18n:fix` - Mark unused keys as deprecated AND add missing keys
- `npm run check-i18n:deprecated` - Only mark unused keys as deprecated
- `npm run check-i18n:missing` - Only add missing keys to default language file

### Key Features
- **Smart Key Extraction**: Detects various `t()` usage patterns including nested keys and interpolation
- **Safe Deprecation**: Preserves unused keys with `__DEPRECATED__` prefix for safety
- **Nested Structure Support**: Maintains hierarchical JSON structure in translation files
- **File Usage Tracking**: Shows which source files use which translation keys
- **Color-coded Output**: Clear visual reporting with emojis and colors for different issue types

### Expected Outcome
- All translation keys are properly tracked and organized
- Unused keys are safely marked as deprecated rather than deleted
- Missing keys are automatically added with placeholder text
- Translation files remain clean and maintainable
- Development workflow includes regular i18n hygiene checks

## Stock Symbol Autocomplete Implementation (Completed)

### Complete Integration with Existing UI System
- **StockSymbolInput Component**: Custom autocomplete component that extends the existing Input component design
- **RTK Query Integration**: Symbol search endpoint added to the stock API with proper caching and error handling
- **Theme Consistency**: Follows existing dark/light theme patterns with smooth transitions
- **Accessibility**: Full ARIA attributes, keyboard navigation, and screen reader support
- **Form Integration**: Seamlessly integrated into the AddPurchase form with validation

### Key Features Implemented
- **Real-time Search**: 300ms debounced search with loading indicators
- **Rich Suggestions**: Shows symbol, company name, exchange, and asset type
- **Keyboard Navigation**: Arrow keys, Enter, and Escape support
- **Visual Feedback**: Loading spinners, hover states, and selection highlighting
- **Error Handling**: Network errors and API failures gracefully handled
- **Type Safety**: Full TypeScript integration with proper type definitions

### API Integration
- **Symbol Search Endpoint**: `GET /api/symbols/search?q=query&limit=10`
- **Response Caching**: 5-minute cache duration for search results
- **Authentication**: Uses existing JWT token system
- **Error Handling**: Proper error states and user feedback

### User Experience Improvements
- **Faster Input**: Users can quickly find symbols without memorizing exact tickers
- **Reduced Errors**: Autocomplete prevents invalid symbol entry
- **Rich Information**: Users see company name and exchange before selecting
- **Accessibility**: Screen reader compatible with proper ARIA labels

### Files Added/Modified for Autocomplete
- `frontend/src/components/ui/StockSymbolInput.tsx` - Main autocomplete component
- `frontend/src/components/ui/StockSymbolInput.example.tsx` - Usage examples
- `frontend/src/store/api/stockApi.ts` - Added symbol search endpoint
- `frontend/src/pages/AddPurchase.tsx` - Integrated autocomplete component
- `frontend/public/locales/en/translation.json` - Added autocomplete translations
- `frontend/public/locales/es/translation.json` - Added Spanish autocomplete translations

## Theme System Implementation (Completed)

### Complete Light/Dark Theme System
- **TailwindCSS v4 Integration**: Enhanced configuration with CSS custom properties for seamless theme switching
- **Theme Persistence**: localStorage integration with system preference detection
- **Smooth Transitions**: CSS-powered animations for theme switching with 300ms duration
- **System Theme Support**: Automatic detection and following of OS theme preferences
- **Theme Toggle Component**: Enhanced UI component with visual feedback and keyboard shortcuts

### Key Features Implemented
- **CSS Custom Properties**: Theme-aware color system using RGB values for proper opacity support
- **Enhanced Theme Slice**: Robust Redux state management with initialization and error handling
- **Custom Theme Hook**: Comprehensive `useTheme` hook with utility functions and theme effects
- **Document Integration**: Automatic DOM class management and meta theme-color updates
- **Keyboard Shortcuts**: Ctrl/Cmd + Shift + T for quick theme cycling
- **Mobile Support**: Theme-color meta tag for mobile browser UI theming

### Files Added/Modified
- `frontend/tailwind.config.js` - Enhanced with CSS custom properties and theme variables
- `frontend/src/index.css` - Comprehensive theme system with smooth transitions
- `frontend/src/components/ui/ThemeToggle.tsx` - Enhanced with animations and tooltips
- `frontend/src/hooks/useTheme.ts` - Complete theme management hook with utilities
- `frontend/src/store/slices/themeSlice.ts` - Robust theme state management
- `frontend/src/App.tsx` - Theme initialization and system integration

### Theme System Features
- **Light/Dark/System Modes**: Full support for all theme preferences
- **Automatic System Detection**: Real-time system theme change detection
- **Smooth Animations**: CSS-powered transitions for theme switching
- **Theme Persistence**: localStorage with fallback to system preference
- **Error Handling**: Graceful degradation when localStorage is unavailable
- **Accessibility**: Proper focus management and keyboard navigation
- **Mobile Optimization**: Theme-aware meta tags for mobile browsers

## How to contribute as a AI tool

1. Read the application content and task.
2  If you need to contribute to frontend read: HOW_TO_CONTRIBUTE__REACT guide.
3. If you need to contribute to backend read: HOW_TO_CONTRIBUTE__RUST guide.
4. Apply changes to the code.
5. Change APPLICATION_CONTEXT file if needed according to changes in step.
6. Leave TODO comment in TODO.md file if something should be done lately.
7. Provide very short feedback of changes. Do not create file for that.
