import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Scale, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import ThemeToggle from "../../components/ui/ThemeToggle";
import LanguageSelector from "../../components/layout/LanguageSelector";
import { Footer } from "../../components/layout/Footer";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

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
              seed="2"
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

const TermsOfService: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
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
                <FileText className="h-6 w-6 text-primary-600" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("legal.termsOfService.title")}
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
              {t("legal.termsOfService.title")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t("legal.termsOfService.lastUpdated")}{" "}
              {new Date().toLocaleDateString()}
            </p>
            <div className="mt-6">
              <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  {t("legal.termsOfService.subtitle")}
                </span>
              </div>
            </div>
          </div>

          {/* Agreement */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("legal.termsOfService.sections.agreement")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              {t("legal.termsOfService.content.agreementText")}
            </p>
          </Card>

          {/* Service Description */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t("legal.termsOfService.sections.serviceDescription")}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.serviceDescription.educationalTool.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.termsOfService.content.serviceDescription.educationalTool.text",
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.serviceDescription.notFinancialAdvice.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.termsOfService.content.serviceDescription.notFinancialAdvice.text",
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.serviceDescription.dataTrackingOnly.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.termsOfService.content.serviceDescription.dataTrackingOnly.text",
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* User Responsibilities */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t("legal.termsOfService.sections.userResponsibilities")}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.userResponsibilities.accountSecurity.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                  {(
                    t(
                      "legal.termsOfService.content.userResponsibilities.accountSecurity.items",
                      {
                        returnObjects: true,
                      },
                    ) as string[]
                  ).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.userResponsibilities.accurateInformation.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                  {(
                    t(
                      "legal.termsOfService.content.userResponsibilities.accurateInformation.items",
                      {
                        returnObjects: true,
                      },
                    ) as string[]
                  ).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.userResponsibilities.appropriateUse.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                  {(
                    t(
                      "legal.termsOfService.content.userResponsibilities.appropriateUse.items",
                      {
                        returnObjects: true,
                      },
                    ) as string[]
                  ).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Disclaimers */}
          <Card className="p-8 border-2 border-yellow-200 dark:border-yellow-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              <HandDrawnCircle>
                {t("legal.termsOfService.sections.disclaimers")}
              </HandDrawnCircle>
            </h2>

            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      {t(
                        "legal.termsOfService.content.disclaimers.noFinancialAdvice.title",
                      )}
                    </h4>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      {t(
                        "legal.termsOfService.content.disclaimers.noFinancialAdvice.text",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.disclaimers.dataAccuracy.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.termsOfService.content.disclaimers.dataAccuracy.text",
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.disclaimers.noGuarantees.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.termsOfService.content.disclaimers.noGuarantees.text",
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Service Availability */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t("legal.termsOfService.sections.serviceAvailability")}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.serviceAvailability.maintenance.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.termsOfService.content.serviceAvailability.maintenance.text",
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.serviceAvailability.featureChanges.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.termsOfService.content.serviceAvailability.featureChanges.text",
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Account Termination */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t("legal.termsOfService.sections.termination")}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.termination.yourRight.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("legal.termsOfService.content.termination.yourRight.text")}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.termination.serviceTermination.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.termsOfService.content.termination.serviceTermination.text",
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Limitation of Liability */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t("legal.termsOfService.sections.liability")}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.liability.educationalPurpose.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.termsOfService.content.liability.educationalPurpose.text",
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <HandDrawnCircle>
                    {t(
                      "legal.termsOfService.content.liability.maximumLiability.title",
                    )}
                  </HandDrawnCircle>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(
                    "legal.termsOfService.content.liability.maximumLiability.text",
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Changes to Terms */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <HandDrawnCircle>
                {t("legal.termsOfService.sections.changes")}
              </HandDrawnCircle>
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t("legal.termsOfService.content.changesText")}
            </p>
          </Card>

          {/* Governing Law */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <HandDrawnCircle>
                {t("legal.termsOfService.sections.governingLaw")}
              </HandDrawnCircle>
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t("legal.termsOfService.content.governingLawText")}
            </p>
          </Card>

          {/* Contact */}
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("legal.termsOfService.sections.questions")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t("legal.termsOfService.content.questionsText")}
            </p>
            <Button
              as="a"
              href="mailto:raman.birulia@gmail.com?subject=Terms of Service Question - Stock Tracker"
              variant="primary"
              size="lg"
            >
              {t("legal.common.contactUs")}
            </Button>
          </Card>

          {/* Acceptance */}
          <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                {t("legal.termsOfService.content.acceptance.title")}
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                {t("legal.termsOfService.content.acceptance.subtitle")}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
