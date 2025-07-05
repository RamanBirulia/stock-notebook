import React from "react";
import { Heart, Github, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 mb-6 sm:mb-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t("footer.brand.name")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 sm:mb-4 max-w-md pr-4">
              {t("footer.brand.description")}
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{t("footer.brand.madeWith")}</span>
              <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" />
              <span>{t("footer.brand.forInvestors")}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-6 sm:mb-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 sm:mb-4">
              {t("footer.features.title")}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <span className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                  {t("footer.features.portfolioTracking")}
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                  {t("footer.features.realTimeData")}
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                  {t("footer.features.interactiveCharts")}
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                  {t("footer.features.profitAnalysis")}
                </span>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div className="mb-6 sm:mb-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 sm:mb-4">
              {t("footer.connect.title")}
            </h4>
            <div className="flex space-x-3 sm:space-x-4">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label={t("footer.connect.github")}
              >
                <Github className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label={t("footer.connect.twitter")}
              >
                <Twitter className="h-5 w-5" />
              </button>
              <a
                href="mailto:raman.birulia@gmail.com?subject=Hello from Stock Tracker"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label={t("footer.connect.email")}
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
              © {currentYear} {t("footer.brand.name")}.{" "}
              {t("footer.legal.copyright")}
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6">
              <Link
                to="/privacy-policy"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t("footer.legal.privacyPolicy")}
              </Link>
              <Link
                to="/terms-of-service"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t("footer.legal.termsOfService")}
              </Link>
              <a
                href="mailto:raman.birulia@gmail.com?subject=Support Request - Stock Tracker"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t("footer.legal.support")}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed px-2">
            <strong>{t("footer.disclaimer.title")}</strong>{" "}
            {t("footer.disclaimer.text")}
          </p>
        </div>
      </div>
    </footer>
  );
};
