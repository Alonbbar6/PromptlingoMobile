import React, { useState } from 'react';
import { clsx } from 'clsx';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  className?: string;
}

/**
 * FAQ - Frequently Asked Questions accordion component
 * Adapted from fenago21 FAQ component
 */
export const FAQ: React.FC<FAQProps> = ({ items, className }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  return (
    <div className={clsx('space-y-4', className)}>
      {items.map((item, index) => (
        <div 
          key={index}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:border-brand-skyBlue"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-neutral-textPrimary">
              {item.question}
            </span>
            <svg
              className={clsx(
                'w-5 h-5 text-brand-skyBlue transition-transform duration-200 flex-shrink-0',
                openIndex === index && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </button>
          
          <div
            className={clsx(
              'overflow-hidden transition-all duration-200',
              openIndex === index ? 'max-h-96' : 'max-h-0'
            )}
          >
            <div className="px-6 pb-4 text-neutral-textSecondary leading-relaxed">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;
