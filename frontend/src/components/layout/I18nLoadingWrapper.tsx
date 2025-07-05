import React from 'react';
import { useI18nReady } from '../../hooks/i18n/useI18nReady';

import { SEOHead, generateSEOConfig } from '../SEO';
import SkeletonHeader from "../ui/loading/SkeletonHeader";
import {SkeletonDashboard} from "../ui/loading/Skeleton";

interface I18nLoadingWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showHeaderSkeleton?: boolean;
  showContentSkeleton?: boolean;
  pageKey?: keyof typeof import('../SEO/seoUtils').PAGE_CONFIGS;
  className?: string;
}

const I18nLoadingWrapper: React.FC<I18nLoadingWrapperProps> = ({
  children,
  fallback,
  showHeaderSkeleton = true,
  showContentSkeleton = true,
  pageKey,
  className = '',
}) => {
  const { isReady, isLoading, error } = useI18nReady();

  // Handle i18n loading error
  if (error) {
    return (
      <>
        {pageKey && <SEOHead {...generateSEOConfig(pageKey)} />}
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${className}`}>
          <div className="max-w-md mx-auto text-center p-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Failed to load language resources. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show loading state while i18n is loading
  if (isLoading || !isReady) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <>
        {pageKey && <SEOHead {...generateSEOConfig(pageKey)} />}
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col ${className}`}>
          {/* Header Skeleton */}
          {showHeaderSkeleton && <SkeletonHeader />}

          {/* Content Skeleton */}
          {showContentSkeleton && (
            <main className="min-h-screen max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
              <SkeletonDashboard />
            </main>
          )}
        </div>
      </>
    );
  }

  // Render children when i18n is ready
  return <div className={className}>{children}</div>;
};

// Specialized wrappers for different use cases
export const I18nPageWrapper: React.FC<Omit<I18nLoadingWrapperProps, 'showHeaderSkeleton' | 'showContentSkeleton'>> = (props) => (
  <I18nLoadingWrapper {...props} showHeaderSkeleton={true} showContentSkeleton={true} />
);

export const I18nHeaderWrapper: React.FC<Omit<I18nLoadingWrapperProps, 'showHeaderSkeleton' | 'showContentSkeleton'>> = (props) => (
  <I18nLoadingWrapper {...props} showHeaderSkeleton={true} showContentSkeleton={false} />
);

export const I18nContentWrapper: React.FC<Omit<I18nLoadingWrapperProps, 'showHeaderSkeleton' | 'showContentSkeleton'>> = (props) => (
  <I18nLoadingWrapper {...props} showHeaderSkeleton={false} showContentSkeleton={false} />
);

// Quick loading wrapper with minimal skeleton
export const I18nQuickWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const { isReady } = useI18nReady();

  if (!isReady) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default I18nLoadingWrapper;
