import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, X, AlertCircle, Info, Clock } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration (unless persistent)
    if (!notification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  const getNotificationConfig = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700'
        };
    }
  };

  const config = getNotificationConfig(notification.type);
  const IconComponent = config.icon;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${config.bgColor} ${config.borderColor}
        border rounded-lg shadow-lg p-4 max-w-sm
      `}
    >
      <div className="flex items-start">
        <IconComponent className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-medium ${config.titleColor}`}>
            {notification.title}
          </h4>
          <p className={`text-sm mt-1 ${config.messageColor}`}>
            {notification.message}
          </p>
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className={`
                text-sm font-medium mt-2 hover:underline
                ${config.titleColor}
              `}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className={`ml-3 flex-shrink-0 ${config.iconColor} hover:opacity-70`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Utility functions for common notification types
export const createEventNotifications = {
  eventApproved: (eventTitle: string): Omit<Notification, 'id'> => ({
    type: 'success',
    title: 'Event Approved!',
    message: `Your event "${eventTitle}" has been approved and is now live.`,
    duration: 7000
  }),

  eventRejected: (eventTitle: string, reason?: string): Omit<Notification, 'id'> => ({
    type: 'error',
    title: 'Event Rejected',
    message: reason 
      ? `Your event "${eventTitle}" was rejected. Reason: ${reason}`
      : `Your event "${eventTitle}" was rejected. Please contact support for details.`,
    duration: 10000
  }),

  eventPending: (eventTitle: string): Omit<Notification, 'id'> => ({
    type: 'info',
    title: 'Event Submitted',
    message: `Your event "${eventTitle}" is pending approval. You'll be notified once it's reviewed.`,
    duration: 6000
  }),

  bulkApprovalSuccess: (count: number): Omit<Notification, 'id'> => ({
    type: 'success',
    title: 'Bulk Approval Complete',
    message: `Successfully approved ${count} event${count > 1 ? 's' : ''}.`,
    duration: 5000
  }),

  bulkApprovalPartial: (successful: number, failed: number): Omit<Notification, 'id'> => ({
    type: 'warning',
    title: 'Bulk Approval Partial',
    message: `Approved ${successful} event${successful > 1 ? 's' : ''}, ${failed} failed.`,
    duration: 7000
  }),

  permissionDenied: (): Omit<Notification, 'id'> => ({
    type: 'error',
    title: 'Permission Denied',
    message: 'You do not have permission to perform this action.',
    duration: 5000
  })
};

export default NotificationProvider;
