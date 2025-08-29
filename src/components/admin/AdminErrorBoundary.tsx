'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  BugAntIcon 
} from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  lang: Language;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('🚨 Admin Error Boundary caught an error:', error);
    console.error('📍 Error Info:', errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    // Report error to monitoring service (if available)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Log to localStorage for debugging
      const errorReport = {
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      const existingErrors = JSON.parse(localStorage.getItem('admin_error_reports') || '[]');
      existingErrors.push(errorReport);
      
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      
      localStorage.setItem('admin_error_reports', JSON.stringify(existingErrors));
      
      console.log('📝 Error report saved:', errorReport);
    } catch (reportError) {
      console.error('❌ Failed to report error:', reportError);
    }
  };

  private handleRetry = () => {
    // Clear error state and retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
    
    // Force a re-render
    window.location.reload();
  };

  private handleReset = () => {
    // Clear error state without reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  render() {
    const { lang, fallback } = this.props;
    const isRTL = lang === 'ar';

    const texts = {
      ar: {
        title: 'خطأ في لوحة الإدارة',
        description: 'حدث خطأ غير متوقع في لوحة الإدارة',
        errorId: 'معرف الخطأ',
        errorMessage: 'رسالة الخطأ',
        errorDetails: 'تفاصيل الخطأ',
        retry: 'إعادة المحاولة',
        reset: 'إعادة تعيين',
        reportSent: 'تم إرسال تقرير الخطأ',
        contactSupport: 'إذا استمر الخطأ، يرجى الاتصال بالدعم الفني',
        timestamp: 'وقت الخطأ',
        showDetails: 'إظهار التفاصيل',
        hideDetails: 'إخفاء التفاصيل'
      },
      en: {
        title: 'Admin Panel Error',
        description: 'An unexpected error occurred in the admin panel',
        errorId: 'Error ID',
        errorMessage: 'Error Message',
        errorDetails: 'Error Details',
        retry: 'Retry',
        reset: 'Reset',
        reportSent: 'Error report sent',
        contactSupport: 'If the error persists, please contact technical support',
        timestamp: 'Error Time',
        showDetails: 'Show Details',
        hideDetails: 'Hide Details'
      }
    };

    const t = texts[lang];

    if (this.state.hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 rtl:space-x-reverse text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="h-6 w-6" />
                <span>{t.title}</span>
              </CardTitle>
              <CardDescription>
                {t.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Summary */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                      {t.errorId}:
                    </span>
                    <code className="text-xs bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                      {this.state.errorId}
                    </code>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                      {t.timestamp}:
                    </span>
                    <span className="text-xs text-red-700 dark:text-red-300">
                      {new Date().toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  
                  {this.state.error && (
                    <div>
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">
                        {t.errorMessage}:
                      </span>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1 font-mono">
                        {this.state.error.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Details (Collapsible) */}
              {this.state.error && (
                <details className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <summary className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 rtl:space-x-reverse">
                    <BugAntIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{t.errorDetails}</span>
                  </summary>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40 mt-2">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry}
                  className="flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>{t.retry}</span>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleReset}
                  className="flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <span>{t.reset}</span>
                </Button>
              </div>

              {/* Support Message */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                <p>{t.contactSupport}</p>
                <p className="mt-1 text-xs">
                  {t.reportSent} • ID: {this.state.errorId}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
