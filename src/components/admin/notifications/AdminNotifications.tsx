'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Language } from '@/types';
import { AdminFadeIn, AdminSlideIn } from '../animations/AdminAnimations';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AdminNotification {
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
  timestamp: Date;
}

interface NotificationContextType {
  notifications: AdminNotification[];
  addNotification: (notification: Omit<AdminNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification Provider
export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const addNotification = (notification: Omit<AdminNotification, 'id' | 'timestamp'>) => {
    const id = Date.now().toString();
    const newNotification: AdminNotification = {
      ...notification,
      id,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration (default 5 seconds)
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notifications
export function useAdminNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useAdminNotifications must be used within AdminNotificationProvider');
  }
  return context;
}

// Individual Notification Component
export function AdminNotificationItem({ 
  notification, 
  onRemove,
  lang = 'en'
}: {
  notification: AdminNotification;
  onRemove: (id: string) => void;
  lang?: Language;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const isRTL = lang === 'ar';

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <AdminSlideIn
      direction={isRTL ? 'left' : 'right'}
      className={`
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}
    >
      <div className={`
        p-4 rounded-lg border shadow-lg max-w-sm w-full
        ${getBackgroundColor()}
      `}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {notification.message}
            </p>
            
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {notification.action.label}
              </button>
            )}
          </div>
          
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </AdminSlideIn>
  );
}

// Notification Container
export function AdminNotificationContainer({ lang = 'en' }: { lang?: Language }) {
  const { notifications, removeNotification } = useAdminNotifications();
  const isRTL = lang === 'ar';

  return (
    <div className={`
      fixed top-4 ${isRTL ? 'left-4' : 'right-4'} z-50 space-y-3
      max-h-screen overflow-y-auto
    `}>
      {notifications.map(notification => (
        <AdminNotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
          lang={lang}
        />
      ))}
    </div>
  );
}

// Quick notification functions
export const adminNotify = {
  success: (title: string, message: string, options?: Partial<AdminNotification>) => {
    // This would be used with the context
    return { type: 'success' as const, title, message, ...options };
  },
  
  error: (title: string, message: string, options?: Partial<AdminNotification>) => {
    return { type: 'error' as const, title, message, ...options };
  },
  
  warning: (title: string, message: string, options?: Partial<AdminNotification>) => {
    return { type: 'warning' as const, title, message, ...options };
  },
  
  info: (title: string, message: string, options?: Partial<AdminNotification>) => {
    return { type: 'info' as const, title, message, ...options };
  }
};

// Notification Bell Component
export function AdminNotificationBell({ 
  lang = 'en',
  className = '' 
}: { 
  lang?: Language;
  className?: string;
}) {
  const { notifications, clearAll } = useAdminNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = lang === 'ar';
  
  const unreadCount = notifications.length;

  const texts = {
    notifications: isRTL ? 'الإشعارات' : 'Notifications',
    clearAll: isRTL ? 'مسح الكل' : 'Clear All',
    noNotifications: isRTL ? 'لا توجد إشعارات' : 'No notifications',
    markAllRead: isRTL ? 'تحديد الكل كمقروء' : 'Mark all as read'
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={`
            absolute top-12 ${isRTL ? 'left-0' : 'right-0'} w-80 bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50
          `}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {texts.notifications}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {texts.clearAll}
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <BellIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{texts.noNotifications}</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {(() => {
                            switch (notification.type) {
                              case 'success':
                                return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
                              case 'error':
                                return <XCircleIcon className="h-4 w-4 text-red-600" />;
                              case 'warning':
                                return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />;
                              case 'info':
                                return <InformationCircleIcon className="h-4 w-4 text-blue-600" />;
                            }
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {notification.timestamp.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Toast Notification Component (Alternative to container)
export function AdminToast({ 
  notification, 
  onRemove,
  lang = 'en'
}: {
  notification: AdminNotification;
  onRemove: (id: string) => void;
  lang?: Language;
}) {
  const [progress, setProgress] = useState(100);
  const duration = notification.duration || 5000;

  useEffect(() => {
    if (!notification.persistent) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            onRemove(notification.id);
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [notification.id, notification.persistent, duration, onRemove]);

  const getProgressColor = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
    }
  };

  return (
    <AdminFadeIn className="relative">
      <AdminNotificationItem 
        notification={notification} 
        onRemove={onRemove} 
        lang={lang} 
      />
      {!notification.persistent && (
        <div className="absolute bottom-0 left-0 h-1 bg-gray-200 dark:bg-gray-700 w-full rounded-b-lg overflow-hidden">
          <div 
            className={`h-full transition-all duration-100 ease-linear ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </AdminFadeIn>
  );
}
