import React from "react";

import { Footer } from "./Footer";
import { useI18nReady } from "../../hooks/i18n/useI18nReady";
import {SkeletonDashboard} from "../ui/loading/Skeleton";
import {SkeletonDashboardHeader} from "../ui/loading/SkeletonHeader";

interface LoadingLayoutProps {
  children?: React.ReactNode;
  showContent?: boolean;
  loadingType?: 'dashboard' | 'page' | 'form' | 'table';
  headerVariant?: 'dashboard' | 'landing' | 'simple';
  showFooter?: boolean;
}

const LoadingLayout: React.FC<LoadingLayoutProps> = ({
  children,
  showContent = false,
  loadingType = 'dashboard',
  headerVariant = 'dashboard',
  showFooter = true,
}) => {
  const { isReady } = useI18nReady();

  const renderLoadingContent = () => {
    if (showContent && children) {
      return children;
    }

    switch (loadingType) {
      case 'dashboard':
        return <SkeletonDashboard />;
      case 'page':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse"></div>
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        );
      case 'form':
        return (
          <div className="max-w-md mx-auto space-y-6">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 space-y-4">
                {/* Table header */}
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
                {/* Table rows */}
                {Array.from({ length: 5 }, (_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 4 }, (_, colIndex) => (
                      <div key={colIndex} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <SkeletonDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header - Always show skeleton if i18n not ready */}
      {!isReady && <SkeletonDashboardHeader />}

      {/* Main Content */}
      <main className="min-h-screen max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
        {renderLoadingContent()}
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

export default LoadingLayout;
