import React from 'react';
import { clsx } from 'clsx';

interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
  className?: string;
}

/**
 * FeatureCard - Display features with icon, title, and description
 * Adapted from fenago21 FeaturesGrid component
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  highlight = false,
  className
}) => {
  return (
    <div className={clsx(
      'p-6 rounded-xl transition-all duration-300',
      highlight 
        ? 'bg-gradient-brand text-white shadow-lg hover:shadow-xl' 
        : 'bg-white border border-gray-200 hover:border-brand-skyBlue hover:shadow-md',
      className
    )}>
      {icon && (
        <div className={clsx(
          'mb-4 w-12 h-12 rounded-lg flex items-center justify-center',
          highlight ? 'bg-white/20' : 'bg-brand-skyBlue/10'
        )}>
          {icon}
        </div>
      )}
      <h3 className={clsx(
        'text-lg font-semibold mb-2',
        highlight ? 'text-white' : 'text-neutral-textPrimary'
      )}>
        {title}
      </h3>
      <p className={clsx(
        'text-sm leading-relaxed',
        highlight ? 'text-white/90' : 'text-neutral-textSecondary'
      )}>
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
