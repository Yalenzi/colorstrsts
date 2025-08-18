'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { getCurrentAdminSession, signOutAdmin } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminSessionManager from './AdminSessionManager';
import { 
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AdminHeaderProps {
  lang: Language;
  title?: string;
}

export default function AdminHeader({ lang, title }: AdminHeaderProps) {
  const router = useRouter();
  const session = getCurrentAdminSession();
  const isRTL = lang === 'ar';

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      toast.success(isRTL ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
      router.push(`/${lang}/admin/login`);
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error(isRTL ? 'خطأ في تسجيل الخروج' : 'Error logging out');
    }
  };

  const handleSessionExpired = () => {
    router.push(`/${lang}/admin/login`);
  };

  const texts = {
    adminPanel: isRTL ? 'لوحة التحكم الإدارية' : 'Admin Panel',
    welcome: isRTL ? 'مرحباً' : 'Welcome',
    logout: isRTL ? 'تسجيل الخروج' : 'Logout',
    settings: isRTL ? 'الإعدادات' : 'Settings',
    role: {
      super_admin: isRTL ? 'مدير عام' : 'Super Admin',
      admin: isRTL ? 'مدير' : 'Admin',
      moderator: isRTL ? 'مشرف' : 'Moderator'
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'moderator':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* Session Manager */}
      <div className="px-4 sm:px-6 lg:px-8">
        <AdminSessionManager lang={lang} onSessionExpired={handleSessionExpired} />
      </div>

      {/* Header Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title || texts.adminPanel}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ColorTests Management System
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - User Info and Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {session && (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="text-right rtl:text-left">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {texts.welcome}, {session.user.displayName || session.user.email}
                      </span>
                      <Badge className={getRoleBadgeColor(session.user.role)}>
                        {texts.role[session.user.role as keyof typeof texts.role]}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {session.user.email}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/${lang}/admin/settings`)}
                    className="hidden sm:flex"
                  >
                    <Cog6ToothIcon className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {texts.settings}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {texts.logout}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Breadcrumb component for admin pages
interface AdminBreadcrumbProps {
  lang: Language;
  items: Array<{
    label: string;
    href?: string;
  }>;
}

export function AdminBreadcrumb({ lang, items }: AdminBreadcrumbProps) {
  const router = useRouter();
  const isRTL = lang === 'ar';

  return (
    <nav className="px-4 sm:px-6 lg:px-8 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
      <ol className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400">
                {isRTL ? '←' : '→'}
              </span>
            )}
            {item.href ? (
              <button
                onClick={() => router.push(item.href!)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-gray-900 dark:text-white font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
