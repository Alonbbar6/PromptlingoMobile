import React from 'react';
import { clsx } from 'clsx';

interface BrandedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/**
 * BrandedButton - A button component following PromptLingo brand guidelines
 * Adapted from fenago21 UI components with brand design tokens
 */
export const BrandedButton: React.FC<BrandedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-brand-skyBlue text-white hover:bg-primary-700 focus:ring-brand-skyBlue',
    secondary: 'bg-brand-mint text-neutral-textPrimary hover:bg-opacity-80 focus:ring-brand-mint',
    gradient: 'bg-gradient-brand text-white hover:opacity-90 focus:ring-brand-skyBlue',
    outline: 'border-2 border-brand-skyBlue text-brand-skyBlue hover:bg-brand-skyBlue hover:text-white focus:ring-brand-skyBlue'
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default BrandedButton;
