import React from "react";
import { Link } from "react-router-dom";
import { Home, Search, TrendingUp, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { SEOHead } from "../../components/SEO";

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  const seoConfig = {
    title: "Page Not Found (404) - Stock Notebook",
    description:
      "The page you are looking for could not be found. Return to Stock Notebook dashboard to continue tracking your portfolio.",
    keywords: "404, page not found, stock tracker, portfolio dashboard",
    url: "/404",
    noIndex: true, // Don't index error pages
  };

  return (
    <>
      <SEOHead {...seoConfig} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {/* Error Code */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold text-primary-600 dark:text-primary-400 mb-4">
              404
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {t("errors.404.title", "Page Not Found")}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t(
                "errors.404.description",
                "The page you are looking for could not be found.",
              )}
            </p>
          </div>

          {/* Illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Search className="w-16 h-16 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">!</span>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("errors.404.actions.dashboard.title", "Go to Dashboard")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {t(
                  "errors.404.actions.dashboard.description",
                  "Return to your portfolio dashboard to continue tracking your investments.",
                )}
              </p>
              <Link to="/dashboard">
                <Button variant="primary" size="sm" className="w-full">
                  {t("errors.404.actions.dashboard.button", "View Dashboard")}
                </Button>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("errors.404.actions.portfolio.title", "View Portfolio")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {t(
                  "errors.404.actions.portfolio.description",
                  "Check your stock portfolio performance and recent transactions.",
                )}
              </p>
              <Link to="/purchases">
                <Button variant="secondary" size="sm" className="w-full">
                  {t("errors.404.actions.portfolio.button", "View Purchases")}
                </Button>
              </Link>
            </Card>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="ghost"
              size="lg"
              leftIcon={<ArrowLeft className="w-5 h-5" />}
              onClick={() => window.history.back()}
            >
              {t("errors.404.actions.back", "Go Back")}
            </Button>
            <Link to="/">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Home className="w-5 h-5" />}
              >
                {t("errors.404.actions.home", "Go Home")}
              </Button>
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {t("errors.404.help.title", "Still having trouble?")}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm">
              <Link
                to="/help"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                {t("errors.404.help.documentation", "View Documentation")}
              </Link>
              <span className="hidden sm:inline text-gray-400">•</span>
              <Link
                to="/contact"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                {t("errors.404.help.contact", "Contact Support")}
              </Link>
              <span className="hidden sm:inline text-gray-400">•</span>
              <a
                href="mailto:support@stock-notebook.com"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                {t("errors.404.help.email", "Email Us")}
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("errors.404.footer", "Error Code: 404 - Page Not Found")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
