'use client';

import { useState, useEffect } from 'react';
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
  PowerIcon,
  PhotoIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { TestTubeIcon } from '@/components/ui/icons/TestTubeIcon';

interface HeaderProps {
  lang: Language;
}

export function Header({ lang }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [adminKeySequence, setAdminKeySequence] = useState('');
  const [showImageAnalyzer, setShowImageAnalyzer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const t = getTranslationsSync(lang);

  // Check admin session
  useEffect(() => {
    const checkAdminStatus = () => {
      const adminSession = validateAdminSession();
      setIsAdmin(adminSession);
    };

    checkAdminStatus();

    // Check admin status periodically
    const interval = setInterval(checkAdminStatus, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Secure admin access detection (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Only enable in development mode with specific key combination
      if (event.ctrlKey && event.shiftKey && event.altKey && event.key === 'A') {
        router.push(`/${lang}/admin#secure-admin-access`);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lang, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserDropdownOpen) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserDropdownOpen]);

  // Secure logo interaction (development only)
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [logoClickTimer, setLogoClickTimer] = useState<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    // Only enable special access in development mode
    if (process.env.NODE_ENV !== 'development') return;

    setLogoClickCount(prev => prev + 1);

    if (logoClickTimer) {
      clearTimeout(logoClickTimer);
    }

    const timer = setTimeout(() => {
      setLogoClickCount(0);
    }, 2000);

    setLogoClickTimer(timer);

    // Require 5 clicks instead of 3 for better security
    if (logoClickCount >= 4) {
      router.push(`/${lang}/admin#secure-admin-access`);
      setLogoClickCount(0);
    }
  };

  const navigation = [
    { name: t('navigation.home'), href: `/${lang}` },
    { name: t('navigation.tests'), href: `/${lang}/tests` },
    { name: t('navigation.results'), href: `/${lang}/results` },
    { name: lang === 'ar' ? 'محلل الألوان' : 'Color Analyzer', href: `/${lang}/image-analysis` },
  ];

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    try {
      // إذا كان مدير، امسح جلسة المدير
      if (isAdmin) {
        localStorage.removeItem('admin_session');
        setIsAdmin(false);
      }

      // إذا كان مستخدم عادي، سجل خروج من Firebase
      if (user) {
        await logout();
      }

      router.push(`/${lang}`);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div
      role="banner"
      className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-top"
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo - Optimized for mobile */}
          <div className="flex items-center min-w-0 flex-1">
            <Link
              href={`/${lang}`}
              className="flex items-center space-x-2 rtl:space-x-reverse hover:opacity-80 transition-opacity touch-manipulation"
              onClick={(e) => {
                e.preventDefault();
                // Handle both logo click and navigation
                handleLogoClick();
                console.log('Logo clicked, navigating to home:', `/${lang}`);
                router.push(`/${lang}`);
              }}
            >
              <TestTubeIcon className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-foreground truncate">
                {lang === 'ar' ? 'اختبارات الألوان' : 'Color Testing'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          

          {/* Right side actions - Mobile optimized */}
          <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
            {/* Language and Theme - Hidden on small screens, shown in mobile menu */}
            <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse">
              <LanguageSwitcher currentLang={lang} />
              <ThemeToggle />
            </div>

            {user || isAdmin ? (
              <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
                {/* User Profile Dropdown - Desktop */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 rtl:space-x-reverse bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-colors"
                  >
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                      <UserIcon className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300 max-w-24 truncate">
                      {isAdmin ? (lang === 'ar' ? 'المدير' : 'Admin') :
                       (user?.displayName || user?.email?.split('@')[0] || t('navigation.user'))}
                    </span>
                    <ChevronDownIcon className={`h-3 w-3 text-primary-600 dark:text-primary-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div
                      className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {isAdmin ? (lang === 'ar' ? 'المدير' : 'Admin') :
                               (user?.displayName || user?.email?.split('@')[0] || t('navigation.user'))}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
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

                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsUserDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 rtl:ml-3 rtl:mr-0" />
                          {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile user indicator */}
                <div className="md:hidden w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>


                {/* Desktop-only admin/user buttons */}
                <div className="hidden lg:flex items-center space-x-2 rtl:space-x-reverse">
                  {isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="touch-manipulation"
                      >
                        <Link href={`/${lang}/admin`}>
                          <span className="flex items-center">
                            <Cog6ToothIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            <span className="hidden xl:inline">{lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</span>
                          </span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="touch-manipulation"
                      >
                        <Link href={`/${lang}/admin/tests`}>
                          <span className="flex items-center">
                            <TestTubeIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            <span className="hidden xl:inline">{lang === 'ar' ? 'إدارة الاختبارات' : 'Manage Tests'}</span>
                          </span>
                        </Link>
                      </Button>
                    </>
                  )}

                  {user && !isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="touch-manipulation"
                      >
                        <Link href={`/${lang}/profile`}>
                          <span className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            <span className="hidden xl:inline">{t('navigation.profile')}</span>
                          </span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="touch-manipulation"
                      >
                        <Link href={`/${lang}/dashboard`}>
                          <span className="flex items-center">
                            <Cog6ToothIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            <span className="hidden xl:inline">{lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
                          </span>
                        </Link>
                      </Button>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="touch-manipulation"
                  >
                    <PowerIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    <span className="hidden xl:inline">{t('navigation.logout')}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="touch-manipulation"
                >
                  <Link href={`/${lang}/auth/login`}>
                    <span className="text-sm">{t('navigation.login')}</span>
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="touch-manipulation"
                >
                  <Link href={`/${lang}/auth/register`}>
                    <span className="text-sm">{t('navigation.register')}</span>
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button - Enhanced for touch */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Sidebar Navigation */}
        <div
          className={`fixed inset-0 z-50 transform ${
            isMenuOpen ? 'translate-x-0' : lang === 'ar' ? 'translate-x-full' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out lg:hidden`}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className={`relative z-10 w-80 max-w-[85vw] h-full bg-white dark:bg-gray-900 shadow-2xl ${
            lang === 'ar' ? 'mr-auto' : 'ml-auto'
          } safe-area-inset-top safe-area-inset-bottom`}>
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <TestTubeIcon className="h-6 w-6 text-primary-600" />
                <h2 className="text-lg font-bold text-foreground">
                  {lang === 'ar' ? 'القائمة' : 'Menu'}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-6 h-6" />
              </Button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto p-4")
              {/* Language and Theme Controls */}
              <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {lang === 'ar' ? 'الإعدادات' : 'Settings'}
                </h3>
                <div className="flex items-center justify-between">
                  <LanguageSwitcher currentLang={lang} />
                  <ThemeToggle />
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-3">
                  {lang === 'ar' ? 'التنقل' : 'Navigation'}
                </h3>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors touch-manipulation ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-950 border-r-2 border-primary-600'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMenuOpen(false);
                      router.push(item.href);
                    }}
                  >
                    <span className="flex-1">{item.name}</span>
                    {isActive(item.href) && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    )}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setShowImageAnalyzer(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-3 text-base font-medium rounded-lg transition-colors touch-manipulation text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                >
                  <PhotoIcon className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
                  <span className="flex-1">{t('navigation.image_analysis')}</span>
                </button>
              </div>

              {/* User Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                {user || isAdmin ? (
                  <div className="space-y-3">
                    {/* User Profile Card */}
                    <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-primary-700 dark:text-primary-300 truncate">
                            {isAdmin ? (lang === 'ar' ? 'المدير' : 'Admin') :
                             (user?.displayName || user?.email?.split('@')[0] || t('navigation.user'))}
                          </p>
                          <p className="text-sm text-primary-600 dark:text-primary-400 truncate">
                            {isAdmin ? (lang === 'ar' ? 'مدير النظام' : 'System Administrator') :
                             (user?.email || (lang === 'ar' ? 'مستخدم' : 'User'))}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* User Action Links */}
                    <div className="space-y-2">
                      {isAdmin ? (
                        <>
                          <Link
                            href={`/${lang}/admin`}
                            className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Cog6ToothIcon className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
                            <span className="flex-1">{lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</span>
                          </Link>
                          <Link
                            href={`/${lang}/admin/tests`}
                            className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <TestTubeIcon className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
                            <span className="flex-1">{lang === 'ar' ? 'إدارة الاختبارات' : 'Manage Tests'}</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/${lang}/profile`}
                            className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <UserIcon className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
                            <span className="flex-1">{t('navigation.profile')}</span>
                          </Link>
                          <Link
                            href={`/${lang}/dashboard`}
                            className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Cog6ToothIcon className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
                            <span className="flex-1">{lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
                          </Link>
                        </>
                      )}

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors touch-manipulation dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        <PowerIcon className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
                        <span className="flex-1">{t('navigation.logout')}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    {/* Guest User Card */}
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                            {lang === 'ar' ? 'مستخدم زائر' : 'Guest User'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {lang === 'ar' ? 'سجل دخولك للحصول على المزيد' : 'Sign in for more features'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Auth Buttons */}
                    <div className="space-y-2">
                      <Link
                        href={`/${lang}/auth/login`}
                        className="flex items-center justify-center px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>{t('navigation.login')}</span>
                      </Link>
                      <Link
                        href={`/${lang}/auth/register`}
                        className="flex items-center justify-center px-4 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors touch-manipulation shadow-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>{t('navigation.register')}</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
