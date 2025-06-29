import React, { useState } from "react";
import { LogIn } from "lucide-react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Plus,
  Star,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import Login from "../auth/Login";
import ThemeToggle from "../ui/ThemeToggle";
import LanguageSelector from "../layout/LanguageSelector";
import { Footer } from "../layout/Footer";
import { Modal } from "../ui/Modal";

// Fake data for demo dashboard
const fakeDashboardData = {
  total_spent: 25000,
  current_value: 32750,
  profit_loss: 7750,
  profit_loss_percentage: 31.0,
  stocks: [
    {
      symbol: "AAPL",
      quantity: 50,
      current_price: 185.5,
      total_value: 9275,
      total_spent: 7500,
    },
    {
      symbol: "MSFT",
      quantity: 30,
      current_price: 415.75,
      total_value: 12472.5,
      total_spent: 10000,
    },
    {
      symbol: "GOOGL",
      quantity: 20,
      current_price: 142.2,
      total_value: 2844,
      total_spent: 3000,
    },
    {
      symbol: "TSLA",
      quantity: 25,
      current_price: 245.8,
      total_value: 6145,
      total_spent: 4500,
    },
  ],
};

// Hand-drawn style speech bubble component
const SpeechBubble: React.FC<{
  children: React.ReactNode;
  direction?: "left" | "right";
  color?: "primary" | "secondary" | "accent";
  className?: string;
}> = ({ children, direction = "left", color = "primary", className = "" }) => {
  const colorClasses = {
    primary:
      "bg-primary-100 border-primary-300 text-primary-800 dark:bg-primary-900/30 dark:border-primary-600 dark:text-primary-200",
    secondary:
      "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-200",
    accent:
      "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-200",
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
        relative p-4 rounded-2xl border-2 border-dashed
        ${colorClasses[color]}
        transform rotate-1 hover:rotate-0 transition-transform duration-300
        shadow-lg
      `}
      >
        {children}

        {/* Speech bubble tail */}
        <div
          className={`
          absolute ${direction === "left" ? "-left-2" : "-right-2"} top-6
          w-4 h-4 transform rotate-45
          ${colorClasses[color]}
          border-2 border-dashed border-l-0 border-t-0
          ${direction === "left" ? "border-r-0 border-b-0" : "border-l-0 border-b-0"}
        `}
        />
      </div>
    </div>
  );
};

// Demo dashboard component
const DemoDashboard: React.FC = () => {
  const isProfit = fakeDashboardData.profit_loss >= 0;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 transform hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Spent
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${fakeDashboardData.total_spent.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-3 transform hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PieChart className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Current Value
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${fakeDashboardData.current_value.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-3 transform hover:scale-105 transition-transform col-span-2">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {isProfit ? (
                <TrendingUp className="h-6 w-6 text-success-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-danger-600" />
              )}
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Profit/Loss
              </p>
              <p
                className={`text-lg font-bold ${isProfit ? "text-success-600" : "text-danger-600"}`}
              >
                +${fakeDashboardData.profit_loss.toLocaleString()} (+
                {fakeDashboardData.profit_loss_percentage}%)
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stocks Mini Table */}
      <Card className="p-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Your Portfolio
        </h3>
        <div className="space-y-2">
          {fakeDashboardData.stocks.slice(0, 3).map((stock) => {
            const stockProfitLoss = stock.total_value - stock.total_spent;
            const isStockProfit = stockProfitLoss >= 0;

            return (
              <div
                key={stock.symbol}
                className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {stock.symbol}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    {stock.quantity} shares
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    ${stock.total_value.toLocaleString()}
                  </div>
                  <div
                    className={`text-xs ${isStockProfit ? "text-success-600" : "text-danger-600"}`}
                  >
                    {isStockProfit ? "+" : ""}${stockProfitLoss.toFixed(0)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// Demo form component
const DemoForm: React.FC = () => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Add Stock Purchase
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stock Symbol
          </label>
          <input
            type="text"
            value="AAPL"
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value="10"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price
            </label>
            <input
              type="number"
              value="185.50"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Purchase Date
          </label>
          <input
            type="date"
            value="2024-01-15"
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <Button className="w-full" disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Purchase
        </Button>
      </div>
    </Card>
  );
};

const LandingPage: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSignInClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Stock Tracker
              </span>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-4">
              <a
                href="mailto:raman.birulia@gmail.com?subject=Support Request - Stock Tracker"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Support
              </a>
              <LanguageSelector />
              <ThemeToggle />
              <Button
                onClick={handleSignInClick}
                variant="primary"
                size="sm"
                leftIcon={<LogIn className="h-4 w-4" />}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Stock Tracker
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Track your investments with style and precision
          </p>
          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Dashboard Demo Section */}
          <div className="lg:col-span-7 relative">
            <div className="flex items-start space-x-4">
              {/* Hand-drawn description */}
              <div className="flex-shrink-0 mt-8">
                <SpeechBubble
                  direction="right"
                  color="secondary"
                  className="max-w-xs"
                >
                  <p className="text-sm font-medium">
                    📈 Get detailed insights about your portfolio performance!
                  </p>
                  <p className="text-xs mt-1 opacity-75">
                    Real-time data, profit tracking, and beautiful charts
                  </p>
                </SpeechBubble>
              </div>

              {/* Demo Dashboard */}
              <div className="flex-1 max-w-md">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border-4 border-dashed border-primary-200 dark:border-primary-700 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Portfolio Dashboard
                    </h2>
                    <div className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                      <span className="text-xs font-medium text-green-800 dark:text-green-200">
                        LIVE DEMO
                      </span>
                    </div>
                  </div>
                  <DemoDashboard />
                </div>
              </div>
            </div>
          </div>

          {/* Form Demo Section */}
          <div className="lg:col-span-5 relative">
            <div className="flex items-start space-x-4">
              {/* Demo Form */}
              <div className="flex-1 max-w-sm">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border-4 border-dashed border-purple-200 dark:border-purple-700 transform rotate-1 hover:rotate-0 transition-transform duration-300 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Add Purchases
                    </h2>
                    <div className="bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full">
                      <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                        DEMO
                      </span>
                    </div>
                  </div>
                  <DemoForm />
                </div>
              </div>

              {/* Hand-drawn description */}
              <div className="flex-shrink-0 mt-8">
                <SpeechBubble
                  direction="left"
                  color="accent"
                  className="max-w-xs"
                >
                  <p className="text-sm font-medium">
                    💰 Easily add your stock transactions!
                  </p>
                  <p className="text-xs mt-1 opacity-75">
                    Simple form, automatic calculations, instant updates
                  </p>
                </SpeechBubble>
              </div>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className="mt-16 max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to Start Tracking?
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Join thousands of investors who trust our platform
            </p>
          </div>

          <div className="relative">
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce opacity-60"></div>
            <div
              className="absolute -top-2 -right-6 w-6 h-6 bg-green-400 rounded-full animate-bounce opacity-60"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute -bottom-4 -left-6 w-4 h-4 bg-purple-400 rounded-full animate-bounce opacity-60"
              style={{ animationDelay: "1s" }}
            ></div>

            <div className="text-center">
              <Button
                onClick={handleSignInClick}
                variant="primary"
                size="lg"
                leftIcon={<LogIn className="h-5 w-5" />}
                className="px-8 py-3"
              >
                Get Started - Sign In
              </Button>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Create your account in seconds
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Why Choose Stock Tracker?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="transform hover:scale-105 transition-transform">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-dashed border-blue-200 dark:border-blue-700">
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Real-time Tracking
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Get live updates on your portfolio performance with accurate
                  market data
                </p>
              </div>
            </div>

            <div className="transform hover:scale-105 transition-transform">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-dashed border-green-200 dark:border-green-700">
                <PieChart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Beautiful Charts
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Visualize your investment journey with interactive charts and
                  graphs
                </p>
              </div>
            </div>

            <div className="transform hover:scale-105 transition-transform">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-dashed border-purple-200 dark:border-purple-700">
                <DollarSign className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Smart Analytics
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Make informed decisions with comprehensive profit/loss
                  analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        size="md"
        closeButton={true}
        closeOnBackdropClick={true}
        closeOnEscape={true}
      >
        <Login onSuccess={handleLoginSuccess} />
      </Modal>

      <Footer />
    </div>
  );
};

export default LandingPage;
