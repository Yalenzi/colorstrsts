'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { useAuth } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { validateAdminSession } from '@/lib/auth-utils';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  Cog6ToothIcon,
  PowerIcon,
  PhotoIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { TestTubeIcon } from '@/components/ui/icons/TestTubeIcon';

interface HeaderProps {
  lang: Language;
}

export function Header({ lang }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const t = getTranslationsSync(lang);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Header Debug Info:');
    console.log('- User:', user);
    console.log('- User authenticated:', !!user);
    console.log('- User email:', user?.email);
    console.log('- Is admin:', isAdmin);
  }, [user, isAdmin]);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (isMenuOpen && !target.closest('[data-mobile-menu]')) {
        setIsMenuOpen(false);
      }
      
      if (isUserDropdownOpen && !target.closest('[data-user-dropdown]')) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isMenuOpen || isUserDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen, isUserDropdownOpen]);

  const navigation = [
    { name: t('navigation.home'), href: `/${lang}` },
    { name: t('navigation.tests'), href: `/${lang}/tests` },
    { name: t('navigation.results'), href: `/${lang}/results` },
    { name: lang === 'ar' ? 'محلل الألوان' : 'Color Analyzer', href: `/${lang}/image-analysis` },
  ];

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    try {
      console.log('🔄 Starting logout process...');
      
      if (isAdmin) {
        console.log('🔄 Clearing admin session...');
        localStorage.removeItem('admin_session');
        setIsAdmin(false);
      }
      
      await logout();
      console.log('✅ Logout successful');
      
      router.push(`/${lang}`);
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  return (
    <div className="relative">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={`/${lang}`} className="flex items-center space-x-2 rtl:space-x-reverse">
                <TestTubeIcon className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {lang === 'ar' ? 'اختبارات الألوان' : 'Color Tests'}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
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
                <>
                  {/* User Dropdown */}
                  <div className="relative" data-user-dropdown>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔄 User dropdown clicked!');
                        console.log('🔄 Current state:', isUserDropdownOpen);
                        console.log('🔄 User object:', user);
                        setIsUserDropdownOpen(!isUserDropdownOpen);
                        console.log('🔄 New state:', !isUserDropdownOpen);
                      }}
                      className="touch-manipulation bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-800/30 border border-primary-200 dark:border-primary-700"
                    >
                      <span className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                          <UserIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="hidden xl:flex flex-col items-start rtl:items-end">
                          <span className="text-xs font-medium text-primary-700 dark:text-primary-300 leading-tight">
                            {user?.displayName || user?.email?.split('@')[0] || 'User'}
                          </span>
                          <span className="text-xs text-primary-600 dark:text-primary-400 leading-tight">
                            {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
                          </span>
                        </div>
                        <ChevronDownIcon className={`h-3 w-3 text-primary-600 dark:text-primary-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                      </span>
                    </Button>
                    
                    {/* Dropdown Menu */}
                    {isUserDropdownOpen && (
                      <div 
                        className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999]" 
                        style={{ zIndex: 9999 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user?.displayName || user?.email?.split('@')[0] || 'User'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="py-2">
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
                            onClick={() => {
                              handleSignOut();
                              setIsUserDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <PowerIcon className="h-4 w-4 mr-3 rtl:ml-3 rtl:mr-0" />
                            {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Button variant="ghost" asChild>
                    <Link href={`/${lang}/auth/signin`}>
                      {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                    </Link>
                  </Button>
                  <Button asChild>
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
                className="touch-manipulation"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div 
            className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
            data-mobile-menu
          >
            <div className="px-4 py-4 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <LanguageSwitcher currentLang={lang} />
                  <ThemeToggle />
                </div>
                
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href={`/${lang}/profile`}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
                    </Link>
                    <Link
                      href={`/${lang}/dashboard`}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href={`/${lang}/auth/signin`}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                    </Link>
                    <Link
                      href={`/${lang}/auth/signup`}
                      className="block px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {lang === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
