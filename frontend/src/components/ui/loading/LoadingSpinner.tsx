import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  text?: string;
  inline?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  text,
  inline = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-secondary-600 dark:text-secondary-400',
    white: 'text-white',
    gray: 'text-gray-600 dark:text-gray-400',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const containerClasses = inline
    ? 'inline-flex items-center space-x-2'
    : 'flex flex-col items-center justify-center space-y-2';

  return (
    <div className={clsx(containerClasses, className)}>
      <Loader2
        className={clsx(
          sizeClasses[size],
          colorClasses[color],
          'animate-spin'
        )}
      />
      {text && (
        <span
          className={clsx(
            textSizeClasses[size],
            colorClasses[color],
            'font-medium'
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
