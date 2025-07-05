import React from "react";
import { Skeleton, SkeletonCircle } from "./Skeleton";

interface SkeletonHeaderProps {
  className?: string;
  showNavigation?: boolean;
  showUserSection?: boolean;
  variant?: "simple" | "dashboard" | "landing";
}

const SkeletonHeader: React.FC<SkeletonHeaderProps> = ({
  className = "",
  showNavigation = true,
  showUserSection = true,
  variant = "dashboard",
}) => {
  return (
    <header
      className={`bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <SkeletonCircle width="32px" height="32px" />
            <Skeleton width="140px" height="24px" />
          </div>

          {/* Navigation Section (Dashboard variant) */}
          {variant === "dashboard" && showNavigation && (
            <div className="hidden md:flex items-center space-x-8">
              <Skeleton width="80px" height="16px" />
              <Skeleton width="90px" height="16px" />
              <Skeleton width="70px" height="16px" />
              <Skeleton width="60px" height="16px" />
            </div>
          )}

          {/* Landing page navigation */}
          {variant === "landing" && showNavigation && (
            <div className="hidden md:flex items-center space-x-6">
              <Skeleton width="60px" height="16px" />
              <Skeleton width="70px" height="16px" />
              <Skeleton width="50px" height="16px" />
            </div>
          )}

          {/* User Section */}
          {showUserSection && (
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <SkeletonCircle width="32px" height="32px" />

              {/* Language selector */}
              <Skeleton width="60px" height="32px" className="rounded-md" />

              {/* User menu or login button */}
              {variant === "dashboard" ? (
                <div className="flex items-center space-x-3">
                  <SkeletonCircle width="32px" height="32px" />
                  <Skeleton width="80px" height="16px" />
                </div>
              ) : (
                <Skeleton width="80px" height="36px" className="rounded-md" />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Specific variants for different layouts
export const SkeletonDashboardHeader: React.FC<
  Omit<SkeletonHeaderProps, "variant">
> = (props) => <SkeletonHeader {...props} variant="dashboard" />;

export const SkeletonLandingHeader: React.FC<
  Omit<SkeletonHeaderProps, "variant">
> = (props) => <SkeletonHeader {...props} variant="landing" />;

export const SkeletonSimpleHeader: React.FC<
  Omit<SkeletonHeaderProps, "variant">
> = (props) => (
  <SkeletonHeader {...props} variant="simple" showNavigation={false} />
);

export default SkeletonHeader;
