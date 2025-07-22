'use client';

import React, { useEffect } from 'react';
import { Language } from '@/types';
import { ThemeProvider } from '../theme/ThemeProvider';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Toaster } from '@/components/ui/toaster';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AdminLayoutProps {
  children: React.ReactNode;
  lang: Language;
  className?: string;
  loading?: boolean;
}

export function AdminLayout({ children, lang, className = '', loading = false }: AdminLayoutProps) {
  const isRTL = lang === 'ar';

  // Load admin theme CSS
  useEffect(() => {
    // Import admin theme CSS
    import('@/styles/admin-theme.css');
    
    // Set document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Add admin body class
    document.body.classList.add('admin-theme');
    
    return () => {
      document.body.classList.remove('admin-theme');
    };
  }, [isRTL, lang]);

  return (
    <ThemeProvider defaultMode="light" defaultCustomTheme="blue">
      <div className={`admin-container ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Sidebar */}
        <AdminSidebar lang={lang} />
        
        {/* Header */}
        <AdminHeader lang={lang} />
        
        {/* Main Content */}
        <main className="admin-main">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            children
          )}
        </main>
        
        {/* Toast Notifications */}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

// Page wrapper component for consistent spacing
export function AdminPageWrapper({ 
  children, 
  title, 
  description, 
  actions,
  className = '',
  lang = 'en'
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  lang?: Language;
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

// Grid layout component for dashboard cards
export function AdminGrid({ 
  children, 
  cols = 'auto',
  gap = 'normal',
  className = '' 
}: {
  children: React.ReactNode;
  cols?: 'auto' | '1' | '2' | '3' | '4' | '5' | '6';
  gap?: 'tight' | 'normal' | 'loose';
  className?: string;
}) {
  const colsClass = {
    'auto': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    '5': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    '6': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClass = {
    'tight': 'gap-3',
    'normal': 'gap-6',
    'loose': 'gap-8'
  };

  return (
    <div className={`grid ${colsClass[cols]} ${gapClass[gap]} ${className}`}>
      {children}
    </div>
  );
}

// Section component for organizing content
export function AdminSection({ 
  children, 
  title, 
  description,
  actions,
  className = '',
  lang = 'en'
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  lang?: Language;
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div>
        {children}
      </div>
    </section>
  );
}

// Card component with admin styling
export function AdminCard({ 
  children, 
  title, 
  description,
  actions,
  className = '',
  hover = true,
  padding = 'normal'
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'tight' | 'normal' | 'loose';
}) {
  const paddingClass = {
    'none': '',
    'tight': 'p-4',
    'normal': 'p-6',
    'loose': 'p-8'
  };

  return (
    <div className={`
      admin-card 
      ${hover ? 'hover:shadow-lg hover:-translate-y-0.5' : ''} 
      ${className}
    `}>
      {(title || description || actions) && (
        <div className="admin-card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-1">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={`admin-card-body ${paddingClass[padding]}`}>
        {children}
      </div>
    </div>
  );
}

// Stats card component
export function AdminStatsCard({ 
  title, 
  value, 
  change,
  changeType = 'neutral',
  icon,
  className = '',
  lang = 'en'
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  lang?: Language;
}) {
  const changeColors = {
    positive: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
    negative: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
    neutral: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
  };

  return (
    <AdminCard className={`${className}`} hover>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {change && (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${changeColors[changeType]}`}>
              {change}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </AdminCard>
  );
}

// Loading state component
export function AdminLoadingState({ message, lang = 'en' }: { message?: string; lang?: Language }) {
  const isRTL = lang === 'ar';
  const defaultMessage = isRTL ? 'جاري التحميل...' : 'Loading...';
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-600 dark:text-gray-400">
        {message || defaultMessage}
      </p>
    </div>
  );
}

// Empty state component
export function AdminEmptyState({ 
  title, 
  description, 
  action,
  icon,
  lang = 'en' 
}: { 
  title: string; 
  description?: string; 
  action?: React.ReactNode;
  icon?: React.ReactNode;
  lang?: Language;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
      {icon && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            {description}
          </p>
        )}
      </div>
      {action && action}
    </div>
  );
}
