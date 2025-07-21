'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Lock, Eye } from 'lucide-react';

export default function SecurityAlert() {
  const [securityStatus, setSecurityStatus] = useState<'secure' | 'warning' | 'danger'>('secure');
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    // فحص الأمان الدوري
    const checkSecurity = () => {
      const newAlerts: string[] = [];

      // فحص console مفتوح
      if (typeof window !== 'undefined') {
        const devtools = /./;
        devtools.toString = function() {
          newAlerts.push('Developer tools detected');
          return 'devtools';
        };
        console.log('%c', devtools);
      }

      // فحص محاولات التلاعب
      if (localStorage.getItem('suspicious_activity')) {
        newAlerts.push('Suspicious activity detected');
      }

      // تحديث حالة الأمان
      if (newAlerts.length > 0) {
        setSecurityStatus('warning');
        setAlerts(newAlerts);
      } else {
        setSecurityStatus('secure');
        setAlerts([]);
      }
    };

    checkSecurity();
    const interval = setInterval(checkSecurity, 30000); // كل 30 ثانية

    return () => clearInterval(interval);
  }, []);

  if (securityStatus === 'secure') return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`p-4 rounded-lg shadow-lg border ${
        securityStatus === 'warning' 
          ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-start space-x-3">
          {securityStatus === 'warning' ? (
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h3 className="font-semibold text-sm">
              {securityStatus === 'warning' ? 'تحذير أمني' : 'تهديد أمني'}
            </h3>
            <ul className="mt-1 text-xs space-y-1">
              {alerts.map((alert, index) => (
                <li key={index}>• {alert}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}