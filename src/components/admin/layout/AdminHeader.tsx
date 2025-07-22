'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeController, QuickThemeToggle } from '../theme/ThemeController';
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  CommandLineIcon,
  ChartBarIcon,
  UsersIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface AdminHeaderProps {
  lang: Language;
  className?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  time: string;
  read: boolean;
}

interface QuickAction {
  id: string;
  label_en: string;
  label_ar: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description_en: string;
  description_ar: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New User Registration',
    message: 'John Doe has registered for an account',
    type: 'info',
    time: '2 minutes ago',
    read: false
  },
  {
    id: '2',
    title: 'System Update',
    message: 'System maintenance scheduled for tonight',
    type: 'warning',
    time: '1 hour ago',
    read: false
  },
  {
    id: '3',
    title: 'Test Completed',
    message: 'Marquis test analysis completed successfully',
    type: 'success',
    time: '3 hours ago',
    read: true
  }
];

const quickActions: QuickAction[] = [
  {
    id: 'analytics',
    label_en: 'View Analytics',
    label_ar: 'عرض التحليلات',
    href: '/admin/analytics',
    icon: ChartBarIcon,
    description_en: 'Dashboard statistics and insights',
    description_ar: 'إحصائيات ورؤى لوحة التحكم'
  },
  {
    id: 'users',
    label_en: 'Manage Users',
    label_ar: 'إدارة المستخدمين',
    href: '/admin/users',
    icon: UsersIcon,
    description_en: 'User management and permissions',
    description_ar: 'إدارة المستخدمين والصلاحيات'
  },
  {
    id: 'tests',
    label_en: 'Chemical Tests',
    label_ar: 'الاختبارات الكيميائية',
    href: '/admin/tests',
    icon: BeakerIcon,
    description_en: 'Manage chemical test database',
    description_ar: 'إدارة قاعدة بيانات الاختبارات الكيميائية'
  }
];

export function AdminHeader({ lang, className = '' }: AdminHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isRTL = lang === 'ar';

  const unreadNotifications = mockNotifications.filter(n => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleLanguageToggle = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    router.push(`/${newLang}/admin`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const texts = {
    search: isRTL ? 'البحث...' : 'Search...',
    notifications: isRTL ? 'الإشعارات' : 'Notifications',
    profile: isRTL ? 'الملف الشخصي' : 'Profile',
    settings: isRTL ? 'الإعدادات' : 'Settings',
    signOut: isRTL ? 'تسجيل الخروج' : 'Sign Out',
    language: isRTL ? 'English' : 'العربية',
    quickActions: isRTL ? 'إجراءات سريعة' : 'Quick Actions',
    viewAll: isRTL ? 'عرض الكل' : 'View All',
    markAllRead: isRTL ? 'تحديد الكل كمقروء' : 'Mark All Read',
    noNotifications: isRTL ? 'لا توجد إشعارات' : 'No notifications'
  };

  return (
    <header className={`admin-header ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Button>

          {showSearch && (
            <div className={`absolute top-12 ${isRTL ? 'right-0' : 'left-0'} w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50`}>
              <form onSubmit={handleSearch} className="p-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={texts.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </form>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {texts.quickActions}
                </h4>
                <div className="space-y-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.id}
                      href={action.href}
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <action.icon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {isRTL ? action.label_ar : action.label_en}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isRTL ? action.description_ar : action.description_en}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Breadcrumb or Page Title */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <CommandLineIcon className="h-4 w-4" />
          <span>{isRTL ? 'لوحة التحكم الإدارية' : 'Admin Dashboard'}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Controller */}
        <ThemeController lang={lang} />

        {/* Quick Theme Toggle */}
        <QuickThemeToggle lang={lang} />

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLanguageToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          title={texts.language}
        >
          <GlobeAltIcon className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
          >
            <BellIcon className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {unreadNotifications}
              </Badge>
            )}
          </Button>

          {showNotifications && (
            <div className={`absolute top-12 ${isRTL ? 'left-0' : 'right-0'} w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{texts.notifications}</h4>
                  <Button variant="ghost" size="sm" className="text-xs">
                    {texts.markAllRead}
                  </Button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.length > 0 ? (
                  mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'error' ? 'bg-red-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'success' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{notification.title}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-500 mt-2 block">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <BellIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{texts.noNotifications}</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" size="sm" className="w-full">
                  {texts.viewAll}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <Button
            variant="ghost"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
              <AvatarFallback>
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>

          {showUserMenu && (
            <div className={`absolute top-12 ${isRTL ? 'left-0' : 'right-0'} w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                    <AvatarFallback>
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {user?.displayName || 'Admin User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Link
                  href="/admin/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="text-sm">{texts.profile}</span>
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <CogIcon className="h-4 w-4" />
                  <span className="text-sm">{texts.settings}</span>
                </Link>
              </div>

              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors w-full"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span className="text-sm">{texts.signOut}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
