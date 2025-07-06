import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeToggle from "../../components/ui/ThemeToggle";
import LanguageSelector from "../../components/layout/LanguageSelector";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Footer } from "../../components/layout/Footer";

// Hand-drawn circle component
const HandDrawnCircle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 120 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10,20 C10,8 15,5 30,5 C50,5 70,5 90,5 C105,5 110,8 110,20 C110,32 105,35 90,35 C70,35 50,35 30,35 C15,35 8,32 8,20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3,2"
          className="text-primary-400 dark:text-primary-500 opacity-60"
          style={{
            filter: "url(#roughen)",
          }}
        />
        <defs>
          <filter id="roughen">
            <feTurbulence
              baseFrequency="0.04"
              numOctaves="3"
              result="noise"
              seed="1"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.5"
              result="roughened"
            />
          </filter>
        </defs>
      </svg>
      <span className="relative z-10 px-3 py-1 text-primary-700 dark:text-primary-300 font-medium">
        {children}
      </span>
    </div>
  );
};

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBackClick}
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                {t("legal.common.back")}
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary-600" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("legal.privacyPolicy.title")}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("legal.privacyPolicy.title")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t("legal.privacyPolicy.lastUpdated")}{" "}
              {new Date().toLocaleDateString()}
            </p>
            <div className="mt-6">
              <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  {t("legal.privacyPolicy.subtitle")}
                </span>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("legal.privacyPolicy.sections.commitment")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              {t("legal.privacyPolicy.content.commitmentText")}
            </p>
          </Card>

          {/* What We Collect */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t("legal.privacyPolicy.sections.whatWeCollect")}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <HandDrawnCircle>
                    {t("legal.privacyPolicy.content.accountInfo.title")}
                  </HandDrawnCircle>
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  {(
                    t("legal.privacyPolicy.content.accountInfo.items", {
                      returnObjects: true,
                    }) as string[]
                  ).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <HandDrawnCircle>
                    {t("legal.privacyPolicy.content.portfolioData.title")}
                  </HandDrawnCircle>
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  {(
                    t("legal.privacyPolicy.content.portfolioData.items", {
                      returnObjects: true,
                    }) as string[]
                  ).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Important:</strong>{" "}
                    {t("legal.privacyPolicy.content.portfolioData.note")}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <HandDrawnCircle>
                    {t("legal.privacyPolicy.content.dontCollect.title")}
                  </HandDrawnCircle>
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  {(
                    t("legal.privacyPolicy.content.dontCollect.items", {
                      returnObjects: true,
                    }) as string[]
                  ).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* How We Use Data */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t("legal.privacyPolicy.sections.howWeUse")}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.privacyPolicy.content.howWeUse.authentication.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.privacyPolicy.content.howWeUse.authentication.text",
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.privacyPolicy.content.howWeUse.portfolioTracking.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.privacyPolicy.content.howWeUse.portfolioTracking.text",
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.privacyPolicy.content.howWeUse.appFunctionality.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.privacyPolicy.content.howWeUse.appFunctionality.text",
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Data Storage & Security */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t("legal.privacyPolicy.sections.dataStorage")}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.privacyPolicy.content.dataStorage.localStorage.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.privacyPolicy.content.dataStorage.localStorage.text",
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.privacyPolicy.content.dataStorage.passwordSecurity.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.privacyPolicy.content.dataStorage.passwordSecurity.text",
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.privacyPolicy.content.dataStorage.accessControl.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.privacyPolicy.content.dataStorage.accessControl.text",
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Data Sharing */}
          <Card className="p-8 border-2 border-green-200 dark:border-green-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <HandDrawnCircle>
                {t("legal.privacyPolicy.sections.dataSharing")}
              </HandDrawnCircle>
            </h2>
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
                {t("legal.privacyPolicy.content.dataSharing.noSharing")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t("legal.privacyPolicy.content.dataSharing.text")}
              </p>
            </div>
          </Card>

          {/* Your Rights */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t("legal.privacyPolicy.sections.yourRights")}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <HandDrawnCircle>
                    {t(
                      "legal.privacyPolicy.content.yourRights.dataDeletion.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                        {t(
                          "legal.privacyPolicy.content.yourRights.dataDeletion.subtitle",
                        )}
                      </h4>
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        {t(
                          "legal.privacyPolicy.content.yourRights.dataDeletion.text",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.privacyPolicy.content.yourRights.dataExport.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("legal.privacyPolicy.content.yourRights.dataExport.text")}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.privacyPolicy.content.yourRights.accountModification.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.privacyPolicy.content.yourRights.accountModification.text",
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("legal.privacyPolicy.sections.questions")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t("legal.privacyPolicy.content.questionsText")}
            </p>
            <Button
              as="a"
              href="mailto:raman.birulia@gmail.com?subject=Privacy Policy Question - Stock Tracker"
              variant="primary"
              size="lg"
            >
              {t("legal.common.contactUs")}
            </Button>
          </Card>

          {/* Updates */}
          <Card className="p-6 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("legal.privacyPolicy.sections.updates")}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t("legal.privacyPolicy.content.updatesText")}
            </p>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
