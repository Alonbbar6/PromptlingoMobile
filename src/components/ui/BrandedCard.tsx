import React from 'react';
import { clsx } from 'clsx';

interface BrandedCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'elevated';
  className?: string;
}

/**
 * BrandedCard - A card component following PromptLingo brand guidelines
 * Provides consistent styling for content containers
 */
export const BrandedCard: React.FC<BrandedCardProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  className
}) => {
  const baseStyles = 'rounded-xl p-6 transition-all duration-200';
  
  const variantStyles = {
    default: 'bg-white border border-gray-200 hover:shadow-md',
    gradient: 'bg-gradient-brand text-white shadow-lg',
    elevated: 'bg-white shadow-lg hover:shadow-xl'
  };
  
  return (
    <div className={clsx(baseStyles, variantStyles[variant], className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className={clsx(
              'text-xl font-semibold mb-1',
              variant === 'gradient' ? 'text-white' : 'text-neutral-textPrimary'
            )}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={clsx(
              'text-sm',
              variant === 'gradient' ? 'text-white/90' : 'text-neutral-textSecondary'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default BrandedCard;
