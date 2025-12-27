import React from 'react';
import { clsx } from 'clsx';

interface TestimonialCardProps {
  name: string;
  role?: string;
  quote: string;
  avatar?: string;
  rating?: number;
  className?: string;
}

/**
 * TestimonialCard - Display user testimonials
 * Adapted from fenago21 Testimonials components
 */
export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  quote,
  avatar,
  rating,
  className
}) => {
  return (
    <div className={clsx(
      'bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300',
      className
    )}>
      {/* Rating */}
      {rating && (
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={clsx(
                'w-5 h-5',
                i < rating ? 'text-warning fill-current' : 'text-gray-300'
              )}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}
      
      {/* Quote */}
      <blockquote className="text-neutral-textPrimary mb-4 leading-relaxed">
        "{quote}"
      </blockquote>
      
      {/* Author */}
      <div className="flex items-center gap-3">
        {avatar ? (
          <img 
            src={avatar} 
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold">
            {name.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-semibold text-neutral-textPrimary">{name}</div>
          {role && (
            <div className="text-sm text-neutral-textSecondary">{role}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
