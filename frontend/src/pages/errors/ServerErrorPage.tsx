import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home, Mail, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { SEOHead } from "../../components/SEO";

const ServerErrorPage: React.FC = () => {
  const { t } = useTranslation();

  const seoConfig = {
    title: "Server Error (500) - Stock Notebook",
    description:
      "We are experiencing technical difficulties. Our team is working to resolve the issue. Please try again later.",
    keywords: "500, server error, technical difficulties, stock tracker",
    url: "/500",
    noIndex: true, // Don't index error pages
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleReportError = () => {
    const errorDetails = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
    };

    const subject = "Server Error Report - Stock Notebook";
    const body = `I encountered a server error while using Stock Notebook.

Error Details:
- Time: ${errorDetails.timestamp}
- Page: ${errorDetails.url}
- Browser: ${errorDetails.userAgent}
- Previous Page: ${errorDetails.referrer || "Direct access"}

Additional Information:
[Please describe what you were doing when the error occurred]
    `;

    window.open(
      `mailto:support@stock-notebook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  return (
    <>
      <SEOHead {...seoConfig} />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {/* Error Code */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold text-red-600 dark:text-red-400 mb-4">
              500
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {t("errors.500.title", "Server Error")}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t(
                "errors.500.description",
                "We are experiencing technical difficulties. Please try again later.",
              )}
            </p>
          </div>

          {/* Illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="w-16 h-16 text-red-600 dark:text-red-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white font-bold text-sm">!</span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <Card className="p-6 mb-8 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              {t("errors.500.status.title", "System Temporarily Unavailable")}
            </h3>
            <p className="text-red-700 dark:text-red-300 text-sm">
              {t(
                "errors.500.status.description",
                "Our servers are experiencing high load or maintenance. This is usually temporary and will be resolved soon.",
              )}
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("errors.500.actions.retry.title", "Try Again")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {t(
                  "errors.500.actions.retry.description",
                  "The issue might be temporary. Refresh the page to try again.",
                )}
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={handleRefresh}
              >
                {t("errors.500.actions.retry.button", "Refresh Page")}
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("errors.500.actions.report.title", "Report Issue")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {t(
                  "errors.500.actions.report.description",
                  "Help us fix this by reporting what you were doing when the error occurred.",
                )}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                leftIcon={<Mail className="w-4 h-4" />}
                onClick={handleReportError}
              >
                {t("errors.500.actions.report.button", "Report Error")}
              </Button>
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
              {t("errors.500.actions.back", "Go Back")}
            </Button>
            <Link to="/">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Home className="w-5 h-5" />}
              >
                {t("errors.500.actions.home", "Go Home")}
              </Button>
            </Link>
          </div>

          {/* Technical Details */}
          <details className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-400 text-sm mb-4 hover:text-gray-800 dark:hover:text-gray-200">
              {t("errors.500.technical.title", "Technical Details")}
            </summary>
            <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs font-mono text-gray-700 dark:text-gray-300">
              <div className="mb-2">
                <strong>Timestamp:</strong> {new Date().toISOString()}
              </div>
              <div className="mb-2">
                <strong>Error Code:</strong> HTTP 500 - Internal Server Error
              </div>
              <div className="mb-2">
                <strong>Request URL:</strong> {window.location.href}
              </div>
              <div className="mb-2">
                <strong>User Agent:</strong> {navigator.userAgent}
              </div>
              <div className="mb-2">
                <strong>Referrer:</strong>{" "}
                {document.referrer || "Direct access"}
              </div>
            </div>
          </details>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {t("errors.500.help.title", "Need immediate assistance?")}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm">
              <Link
                to="/help"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                {t("errors.500.help.documentation", "View Documentation")}
              </Link>
              <span className="hidden sm:inline text-gray-400">•</span>
              <Link
                to="/contact"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                {t("errors.500.help.contact", "Contact Support")}
              </Link>
              <span className="hidden sm:inline text-gray-400">•</span>
              <a
                href="https://status.stock-notebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                {t("errors.500.help.status", "System Status")}
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t(
                "errors.500.footer",
                "Error Code: 500 - Internal Server Error",
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServerErrorPage;
