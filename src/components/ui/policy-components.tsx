'use client';

import React from 'react';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  LockClosedIcon,
  UserGroupIcon,
  ServerIcon,
  CogIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  EyeIcon,
  KeyIcon,
  ClockIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// مكون الإطار المخصص للسياسات
interface PolicyFrameProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'warning' | 'success' | 'info';
  className?: string;
}

export function PolicyFrame({ 
  title, 
  icon, 
  children, 
  variant = 'primary', 
  className = '' 
}: PolicyFrameProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900';
      case 'secondary':
        return 'border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900';
      case 'success':
        return 'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900';
      case 'info':
        return 'border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return 'text-blue-600 dark:text-blue-400';
      case 'secondary':
        return 'text-purple-600 dark:text-purple-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'info':
        return 'text-cyan-600 dark:text-cyan-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={`rounded-2xl border-2 ${getVariantStyles()} p-8 mb-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${className}`}>
      <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
        <div className={`w-14 h-14 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-md ${getIconColor()}`}>
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// مكون النقاط المحسن للسياسات
interface PolicyBulletPointProps {
  icon?: React.ReactNode;
  text: string;
  className?: string;
}

export function PolicyBulletPoint({ icon, text, className = '' }: PolicyBulletPointProps) {
  return (
    <div className={`flex items-start space-x-3 rtl:space-x-reverse mb-4 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200 ${className}`}>
      {icon ? (
        <div className="flex-shrink-0 w-6 h-6 text-current mt-0.5">
          {icon}
        </div>
      ) : (
        <span className="w-3 h-3 bg-current rounded-full mt-2 flex-shrink-0"></span>
      )}
      <p className="text-foreground leading-relaxed font-medium">{text}</p>
    </div>
  );
}

// مكون القسم المحسن
interface PolicySectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function PolicySection({ title, children, className = '' }: PolicySectionProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h3 className="text-xl font-bold text-foreground mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// مكون العنوان المحسن للسياسات
interface PolicyHeaderProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  className?: string;
}

export function PolicyHeader({ title, subtitle, lastUpdated, className = '' }: PolicyHeaderProps) {
  return (
    <div className={`text-center mb-12 ${className}`}>
      <div className="flex items-center justify-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
          <ShieldCheckIcon className="w-10 h-10 text-white" />
        </div>
      </div>
      <h1 className="text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-xl text-muted-foreground mb-6 font-medium">
        {subtitle}
      </p>
      <div className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
        <ClockIcon className="w-5 h-5 text-gray-500 mr-2 rtl:ml-2 rtl:mr-0" />
        <span className="text-sm text-muted-foreground font-medium">
          {lastUpdated}
        </span>
      </div>
    </div>
  );
}

// مكون معلومات الاتصال المحسن
interface ContactInfoProps {
  title: string;
  email: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function ContactInfo({ title, email, variant = 'primary', className = '' }: ContactInfoProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      case 'secondary':
        return 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${getVariantStyles()} ${className}`}>
      <div className="flex items-center mb-3">
        <EnvelopeIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
        <h4 className="font-bold">{title}</h4>
      </div>
      <p className="text-sm font-medium">{email}</p>
    </div>
  );
}

// مكون التحديثات المحسن
interface UpdateNoticeProps {
  children: React.ReactNode;
  className?: string;
}

export function UpdateNotice({ children, className = '' }: UpdateNoticeProps) {
  return (
    <div className={`p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-200 dark:border-amber-800 rounded-xl ${className}`}>
      <div className="flex items-center mb-4">
        <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 mr-3 rtl:ml-3 rtl:mr-0" />
        <h4 className="font-bold text-amber-800 dark:text-amber-200">
          تنبيه مهم
        </h4>
      </div>
      <div className="text-amber-700 dark:text-amber-300">
        {children}
      </div>
    </div>
  );
}

// مجموعة الأيقونات للسياسات
export const PolicyIcons = {
  Shield: ShieldCheckIcon,
  Document: DocumentTextIcon,
  Lock: LockClosedIcon,
  Users: UserGroupIcon,
  Server: ServerIcon,
  Settings: CogIcon,
  Warning: ExclamationTriangleIcon,
  Email: EnvelopeIcon,
  Eye: EyeIcon,
  Key: KeyIcon,
  Clock: ClockIcon,
  Globe: GlobeAltIcon,
  Check: CheckCircleIcon
};
