import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

/**
 * DocsCallout - Alert/callout component for highlighting important information
 *
 * Features:
 * - Multiple types: info, warning, error, success, tip
 * - Icon support
 * - Color-coded styling
 * - Optional title
 *
 * @param {Object} props
 * @param {string} props.type - Callout type: 'info' | 'warning' | 'error' | 'success' | 'tip'
 * @param {string} props.title - Optional callout title
 * @param {React.ReactNode} props.icon - Optional custom icon
 * @param {React.ReactNode} props.children - Callout content
 * @param {string} props.className - Additional CSS classes
 */
const DocsCallout = ({ type = 'info', title, icon, children, className = '' }) => {
  const config = {
    info: {
      icon: Info,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-500',
      textColor: 'text-foreground'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-500',
      textColor: 'text-foreground'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-500',
      textColor: 'text-foreground'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-brand-green/10',
      borderColor: 'border-brand-green/30',
      iconColor: 'text-brand-green',
      textColor: 'text-foreground'
    },
    tip: {
      icon: Lightbulb,
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-500',
      textColor: 'text-foreground'
    }
  };

  const { icon: DefaultIcon, bgColor, borderColor, iconColor, textColor } = config[type] || config.info;
  const IconComponent = icon || DefaultIcon;

  return (
    <div className={`docs-callout ${bgColor} border ${borderColor} rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1">
          {title && (
            <h5 className={`font-semibold ${textColor} mb-2`}>{title}</h5>
          )}
          <div className={`${textColor} text-sm`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsCallout;
