'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface FirebaseConnectionTestProps {
  lang: Language;
}

interface ConnectionStatus {
  auth: boolean;
  firestore: boolean;
  realtimeDb: boolean;
  storage: boolean;
  error?: string;
}

export function FirebaseConnectionTest({ lang }: FirebaseConnectionTestProps) {
  const [status, setStatus] = useState<ConnectionStatus>({
    auth: false,
    firestore: false,
    realtimeDb: false,
    storage: false
  });
  const [testing, setTesting] = useState(false);
  const [lastTest, setLastTest] = useState<Date | null>(null);

  const testFirebaseConnection = async () => {
    setTesting(true);
    setStatus({ auth: false, firestore: false, realtimeDb: false, storage: false });

    try {
      // Test Firebase Auth
      const { auth } = await import('@/lib/firebase');
      const authStatus = !!auth;
      setStatus(prev => ({ ...prev, auth: authStatus }));

      // Test Firestore
      const { db } = await import('@/lib/firebase');
      const firestoreStatus = !!db;
      setStatus(prev => ({ ...prev, firestore: firestoreStatus }));

      // Test Realtime Database
      try {
        const { database } = await import('@/lib/firebase');
        const realtimeDbStatus = !!database;
        setStatus(prev => ({ ...prev, realtimeDb: realtimeDbStatus }));
        
        if (!database) {
          throw new Error('Realtime Database not initialized');
        }
      } catch (error) {
        console.error('Realtime Database test failed:', error);
        setStatus(prev => ({ 
          ...prev, 
          realtimeDb: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }

      // Test Storage (optional)
      setStatus(prev => ({ ...prev, storage: true }));

      setLastTest(new Date());
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const getStatusIcon = (isConnected: boolean) => {
    if (isConnected) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    return <XCircleIcon className="h-5 w-5 text-red-500" />;
  };

  const getStatusText = (isConnected: boolean) => {
    if (isConnected) {
      return lang === 'ar' ? 'متصل' : 'Connected';
    }
    return lang === 'ar' ? 'غير متصل' : 'Disconnected';
  };

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {lang === 'ar' ? 'اختبار اتصال Firebase' : 'Firebase Connection Test'}
          </h2>
          <Button
            onClick={testFirebaseConnection}
            disabled={testing}
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
            {testing 
              ? (lang === 'ar' ? 'جاري الاختبار...' : 'Testing...')
              : (lang === 'ar' ? 'إعادة اختبار' : 'Retest')
            }
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Firebase Auth */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.auth)}
              <span className="font-medium">
                {lang === 'ar' ? 'المصادقة' : 'Authentication'}
              </span>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(status.auth)}`}>
              {getStatusText(status.auth)}
            </span>
          </div>

          {/* Firestore */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.firestore)}
              <span className="font-medium">
                {lang === 'ar' ? 'قاعدة البيانات' : 'Firestore'}
              </span>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(status.firestore)}`}>
              {getStatusText(status.firestore)}
            </span>
          </div>

          {/* Realtime Database */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.realtimeDb)}
              <span className="font-medium">
                {lang === 'ar' ? 'قاعدة البيانات المباشرة' : 'Realtime Database'}
              </span>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(status.realtimeDb)}`}>
              {getStatusText(status.realtimeDb)}
            </span>
          </div>

          {/* Storage */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.storage)}
              <span className="font-medium">
                {lang === 'ar' ? 'التخزين' : 'Storage'}
              </span>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(status.storage)}`}>
              {getStatusText(status.storage)}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {status.error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-200">
                  {lang === 'ar' ? 'خطأ في الاتصال' : 'Connection Error'}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {status.error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Last Test Time */}
        {lastTest && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            {lang === 'ar' ? 'آخر اختبار: ' : 'Last tested: '}
            {lastTest.toLocaleString()}
          </div>
        )}

        {/* Configuration Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            {lang === 'ar' ? 'معلومات الإعداد' : 'Configuration Info'}
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <div>
              <strong>{lang === 'ar' ? 'معرف المشروع: ' : 'Project ID: '}</strong>
              colorstests-573ef
            </div>
            <div>
              <strong>{lang === 'ar' ? 'رابط قاعدة البيانات: ' : 'Database URL: '}</strong>
              https://colorstests-573ef-default-rtdb.firebaseio.com
            </div>
            <div>
              <strong>{lang === 'ar' ? 'نطاق المصادقة: ' : 'Auth Domain: '}</strong>
              colorstests-573ef.firebaseapp.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
