import React from 'react';
import { Shield, Info, AlertTriangle, XCircle } from 'lucide-react';
import { getIssueDescription } from '../utils/contentFilter';

interface FilterStatusNotificationProps {
  wasFiltered: boolean;
  detectedIssues: string[];
  severityLevel: 'none' | 'mild' | 'moderate' | 'severe';
  className?: string;
  showUpgradePrompt?: boolean;
}

const FilterStatusNotification: React.FC<FilterStatusNotificationProps> = ({
  wasFiltered,
  detectedIssues,
  severityLevel,
  className = '',
  showUpgradePrompt = false
}) => {
  if (!wasFiltered || severityLevel === 'none') {
    return null;
  }

  const getNotificationStyle = () => {
    switch (severityLevel) {
      case 'mild':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: Info
        };
      case 'moderate':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          icon: AlertTriangle
        };
      case 'severe':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: XCircle
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: Shield
        };
    }
  };

  const style = getNotificationStyle();
  const IconComponent = style.icon;
  const issueDescription = getIssueDescription(detectedIssues);

  const getMessage = () => {
    switch (severityLevel) {
      case 'mild':
        return 'Content was automatically adjusted for professional translation.';
      case 'moderate':
        return 'Content was significantly modified to meet professional standards.';
      case 'severe':
        return 'Content contained severe violations and was blocked from translation.';
      default:
        return 'Content was processed for professional translation.';
    }
  };

  return (
    <div className={`${style.bgColor} border-l-4 ${style.borderColor} p-4 mb-4 rounded-r-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${style.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${style.textColor}`}>
              Content Filter Active
            </p>
            {severityLevel !== 'severe' && (
              <Shield className={`h-4 w-4 ${style.iconColor}`} />
            )}
          </div>
          <p className={`text-sm ${style.textColor} mt-1`}>
            {getMessage()}
          </p>
          {issueDescription && (
            <p className={`text-xs ${style.textColor} mt-2 opacity-75`}>
              Detected: {issueDescription}
            </p>
          )}
          {showUpgradePrompt && severityLevel !== 'severe' && (
            <div className="mt-3 pt-2 border-t border-current border-opacity-20">
              <button className={`text-xs ${style.textColor} hover:underline font-medium`}>
                Upgrade to Uncensored Version for unfiltered translations →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterStatusNotification;
