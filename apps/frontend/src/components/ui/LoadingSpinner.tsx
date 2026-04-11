import { type FC } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-surface-700" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
      </div>
    </div>
  );
};

export const PageLoader: FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="h-16 w-16 mx-auto rounded-full border-2 border-surface-700" />
        <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-surface-200 mb-1">Loading TechPrep Pro</h3>
      <p className="text-sm text-surface-500">Preparing your workspace...</p>
    </div>
  </div>
);
