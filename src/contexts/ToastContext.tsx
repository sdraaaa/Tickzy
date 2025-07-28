/**
 * Global Toast Context
 * 
 * Provides a global toast notification system that can be used throughout the app
 * Ensures only one ToastContainer is rendered at the app level
 */

import React, { createContext, useContext, useState } from 'react';
import { ToastContainer } from '../components/ui/Toast';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string;
  removeToast: (id: string) => void;
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
  showWarning: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast
    };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    return addToast({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    return addToast({ type: 'error', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    return addToast({ type: 'info', title, message });
  };

  const showWarning = (title: string, message?: string) => {
    return addToast({ type: 'warning', title, message });
  };

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useGlobalToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useGlobalToast must be used within a ToastProvider');
  }
  return context;
};
