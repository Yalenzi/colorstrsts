'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { useAuth } from '@/components/safe-providers';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { validateAdminSession } from '@/lib/auth-utils';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { TestTubeIcon } from '@/components/ui/icons/TestTubeIcon';

interface EnhancedHeaderProps {
  lang: Language;
}

export function EnhancedHeader({ lang }: EnhancedHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const t = getTranslationsSync(lang);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRTL = lang === 'ar';

  // Check admin session
  useEffect(() => {
    const checkAdminStatus = () => {
      const adminSession = validateAdminSession();
      setIsAdmin(adminSession);
    };

    checkAdminStatus();
    const interval = setInterval(checkAdminStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserDropdownOpen]);

  const navigation = [
    { name: t('navigation.home'), href: `/${lang}` },
    { name: t('navigation.tests'), href: `/${lang}/tests` },
    { name: t('navigation.results'), href: `/${lang}/results` },
    { name: lang === 'ar' ? 'محلل الألوان' : 'Color Analyzer', href: `/${lang}/image-analysis` },
  ];

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    try {
      if (isAdmin) {
        localStorage.removeItem('admin_session');
        setIsAdmin(false);
      }

      if (user && logout) {
        await logout();
      }

      setIsUserDropdownOpen(false);
      router.push(`/${lang}`);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={`/${lang}`} className="flex items-center space-x-2 rtl:space-x-reverse">
              <TestTubeIcon className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {lang === 'ar' ? 'اختبار الألوان' : 'Color Test'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                  isActive(item.href)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse">
            <LanguageSwitcher currentLang={lang} />
            <ThemeToggle />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-md text-sm font-medium bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-800/30 border border-primary-200 dark:border-primary-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden lg:block text-left rtl:text-right">
                    <div className="text-xs font-medium text-primary-700 dark:text-primary-300">
                      {isAdmin ? (lang === 'ar' ? 'المدير' : 'Admin') : 
                       (user?.displayName || user?.email?.split('@')[0] || 'User')}
                    </div>
                    <div className="text-xs text-primary-600 dark:text-primary-400">
                      {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
                    </div>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-primary-600 dark:text-primary-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999]">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {isAdmin ? (lang === 'ar' ? 'المدير' : 'Admin') : 
                             (user?.displayName || user?.email?.split('@')[0] || 'User')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {!isAdmin && (
                        <>
                          <Link
                            href={`/${lang}/profile`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <UserIcon className="h-4 w-4 mr-3 rtl:ml-3 rtl:mr-0" />
                            {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
                          </Link>
                          
                          <Link
                            href={`/${lang}/dashboard`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <Cog6ToothIcon className="h-4 w-4 mr-3 rtl:ml-3 rtl:mr-0" />
                            {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                          </Link>
                        </>
                      )}
                      
                      {isAdmin && (
                        <Link
                          href={`/${lang}/admin`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <Cog6ToothIcon className="h-4 w-4 mr-3 rtl:ml-3 rtl:mr-0" />
                          {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 rtl:ml-3 rtl:mr-0" />
                        {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/${lang}/auth/signin`}>
                    {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/${lang}/auth/signup`}>
                    {lang === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  {!isAdmin && (
                    <>
                      <Link
                        href={`/${lang}/profile`}
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
                      </Link>
                      <Link
                        href={`/${lang}/dashboard`}
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link
                      href={`/${lang}/admin`}
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  >
                    {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                  </button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <Link
                    href={`/${lang}/auth/signin`}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                  </Link>
                  <Link
                    href={`/${lang}/auth/signup`}
                    className="block px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {lang === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
