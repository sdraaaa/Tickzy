import React from 'react';
import { CheckCircle, Clock, X, AlertCircle, Calendar } from 'lucide-react';

export type EventStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

interface EventStatusBadgeProps {
  status: EventStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  showText = true,
  className = ''
}) => {
  const getStatusConfig = (status: EventStatus) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          text: 'Approved',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending Approval',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200'
        };
      case 'rejected':
        return {
          icon: X,
          text: 'Rejected',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200'
        };
      case 'cancelled':
        return {
          icon: AlertCircle,
          text: 'Cancelled',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          icon: Calendar,
          text: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        };
    }
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          spacing: 'mr-1'
        };
      case 'md':
        return {
          container: 'px-3 py-1 text-sm',
          icon: 'w-4 h-4',
          spacing: 'mr-2'
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-base',
          icon: 'w-5 h-5',
          spacing: 'mr-2'
        };
      default:
        return {
          container: 'px-3 py-1 text-sm',
          icon: 'w-4 h-4',
          spacing: 'mr-2'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const IconComponent = config.icon;

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses.container}
        ${className}
      `.trim()}
    >
      {showIcon && (
        <IconComponent 
          className={`${sizeClasses.icon} ${config.iconColor} ${showText ? sizeClasses.spacing : ''}`} 
        />
      )}
      {showText && config.text}
    </span>
  );
};

export default EventStatusBadge;
