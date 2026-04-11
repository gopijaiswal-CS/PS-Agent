import { type FC } from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  variant?: 'brand' | 'success' | 'warning' | 'error' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const Badge: FC<BadgeProps> = ({ variant = 'brand', children, className }) => {
  const variants = {
    brand: 'badge-brand',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    neutral: 'badge bg-surface-700/50 text-surface-300 border border-surface-600/30',
  };

  return <span className={cn(variants[variant], className)}>{children}</span>;
};
