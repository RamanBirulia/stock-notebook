import React from "react";
import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "text" | "rectangular" | "circular";
  animation?: "pulse" | "wave" | "none";
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  variant = "rectangular",
  animation = "pulse",
  lines = 1,
}) => {
  const baseClasses = "bg-gray-200 dark:bg-gray-700";

  const variantClasses = {
    text: "rounded",
    rectangular: "rounded-md",
    circular: "rounded-full",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-pulse", // You could implement a wave animation here
    none: "",
  };

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === "number" ? `${width}px` : width;
    if (height)
      style.height = typeof height === "number" ? `${height}px` : height;
    return style;
  };

  const getDefaultDimensions = () => {
    switch (variant) {
      case "text":
        return { height: height || "1em", width: width || "100%" };
      case "circular":
        return { height: height || "40px", width: width || "40px" };
      case "rectangular":
      default:
        return { height: height || "20px", width: width || "100%" };
    }
  };

  const dimensions = getDefaultDimensions();

  if (variant === "text" && lines > 1) {
    return (
      <div className={clsx("space-y-2", className)}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={clsx(
              baseClasses,
              variantClasses[variant],
              animationClasses[animation],
              index === lines - 1 ? "w-3/4" : "w-full",
            )}
            style={{
              height: dimensions.height,
              ...getStyle(),
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className,
      )}
      style={{
        height: dimensions.height,
        width: dimensions.width,
        ...getStyle(),
      }}
    />
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonText: React.FC<Omit<SkeletonProps, "variant">> = (
  props,
) => <Skeleton {...props} variant="text" />;

export const SkeletonCircle: React.FC<Omit<SkeletonProps, "variant">> = (
  props,
) => <Skeleton {...props} variant="circular" />;

export const SkeletonRectangle: React.FC<Omit<SkeletonProps, "variant">> = (
  props,
) => <Skeleton {...props} variant="rectangular" />;

// Complex skeleton components for specific layouts
export const SkeletonCard: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={clsx("p-6 space-y-4", className)}>
    <div className="flex items-center space-x-4">
      <SkeletonCircle width="40px" height="40px" />
      <div className="flex-1 space-y-2">
        <SkeletonText width="60%" />
        <SkeletonText width="40%" />
      </div>
    </div>
    <SkeletonRectangle height="200px" />
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonTable: React.FC<{
  rows?: number;
  cols?: number;
  className?: string;
}> = ({ rows = 5, cols = 4, className }) => (
  <div className={clsx("space-y-4", className)}>
    {/* Header */}
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {Array.from({ length: cols }, (_, index) => (
        <SkeletonText key={index} height="20px" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div
        key={rowIndex}
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }, (_, colIndex) => (
          <SkeletonText key={colIndex} height="16px" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonDashboard: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={clsx("space-y-6", className)}>
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-4"
        >
          <div className="flex items-center justify-between">
            <SkeletonText width="60%" />
            <SkeletonCircle width="24px" height="24px" />
          </div>
          <SkeletonText width="40%" height="32px" />
          <SkeletonText width="80%" height="16px" />
        </div>
      ))}
    </div>

    {/* Chart */}
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-4">
      <SkeletonText width="30%" height="24px" />
      <SkeletonRectangle height="300px" />
    </div>

    {/* Table */}
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-4">
      <SkeletonText width="25%" height="24px" />
      <SkeletonTable rows={5} cols={4} />
    </div>
  </div>
);
