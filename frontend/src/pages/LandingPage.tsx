import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Plus,
  Star,
  LogIn,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import Login from "../components/auth/Login";

import { Footer } from "../components/layout/Footer";
import { Modal } from "../components/ui/Modal";
import {
  SEOHead,
  generateSEOConfig,
  generateApplicationStructuredData,
} from "../components/SEO";

import { useI18nReady } from "../hooks/useI18nReady";
import { SkeletonLandingHeader } from "../components/ui/loading/SkeletonHeader";
import { LandingHeader } from "../components/landing/components/LandingHeader";
import { SpeechBubble } from "../components/landing/components/SpeechBubble";
import { LandingDashboard } from "../components/landing/LandingDashboard";

// Hand-drawn style speech bubble component

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
  const { isReady: isI18Ready } = useI18nReady();

  const handleSignInClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    window.location.reload();
  };

  return (
    <>
      <SEOHead
        {...generateSEOConfig("HOME")}
        structuredData={generateApplicationStructuredData()}
      />
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
        {/* Top Navigation Bar */}
        {isI18Ready ? (
          <LandingHeader handleSignInClick={handleSignInClick} />
        ) : (
          <SkeletonLandingHeader className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm" />
        )}

        <div className="container mx-auto px-4 py-8 flex-1">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              <span className="bg-linear-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Stock Tracker
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Track your investments with style and precision
            </p>
            <div className="flex justify-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-6 w-6 text-yellow-400 fill-current"
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
            {/* Dashboard Demo Section */}
            <div className="lg:col-span-7 relative">
              <div className="flex items-start space-x-4">
                {/* Hand-drawn description */}
                <div className="shrink-0 mt-8">
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

                    <LandingDashboard />
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
                <div className="shrink-0 mt-8">
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
                    Visualize your investment journey with interactive charts
                    and graphs
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
    </>
  );
};

export default LandingPage;
