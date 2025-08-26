'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { useAuth } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  PowerIcon
} from '@heroicons/react/24/outline';
import { TestTubeIcon } from '@/components/ui/icons/TestTubeIcon';

interface SimpleHeaderProps {
  lang: Language;
}

export function SimpleHeader({ lang }: SimpleHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const t = getTranslationsSync(lang) || {};

  const navigation = [
    { name: t?.navigation?.home || (lang === 'ar' ? 'الرئيسية' : 'Home'), href: `/${lang}` },
    { name: t?.navigation?.tests || (lang === 'ar' ? 'الاختبارات' : 'Tests'), href: `/${lang}/tests` },
    { name: t?.navigation?.help || (lang === 'ar' ? 'المساعدة' : 'Help'), href: `/${lang}/help` },
  ];

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    try {
      if (user) {
        await signOut();
      }
      router.push(`/${lang}`);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div 
      role="banner" 
      className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href={`/${lang}`}
              className="flex items-center space-x-2 rtl:space-x-reverse hover:opacity-80 transition-opacity"
            >
              <TestTubeIcon className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-foreground">
                {lang === 'ar' ? 'اختبارات الألوان' : 'Color Testing'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 rtl:space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse">
              <LanguageSwitcher currentLang={lang} />
              <ThemeToggle />
            </div>
            
            {user ? (
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full">
                  <div className="w-6 h-6 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                    <UserIcon className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {user?.full_name || user?.email?.split('@')[0] || t?.navigation?.user || 'User'}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <PowerIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span className="hidden sm:inline">{t?.navigation?.logout || 'Logout'}</span>
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href={`/${lang}/auth/login`}>
                    {t?.navigation?.login || 'Login'}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                >
                  <Link href={`/${lang}/auth/register`}>
                    {t?.navigation?.register || 'Register'}
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between px-3 py-2">
                  <LanguageSwitcher currentLang={lang} />
                  <ThemeToggle />
                </div>
              </div>
              
              {user ? (
                <div className="pt-2">
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <PowerIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t?.navigation?.logout || 'Logout'}
                  </Button>
                </div>
              ) : (
                <div className="pt-2 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full justify-start"
                  >
                    <Link href={`/${lang}/auth/login`} onClick={() => setIsMenuOpen(false)}>
                      {t?.navigation?.login || 'Login'}
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <Link href={`/${lang}/auth/register`} onClick={() => setIsMenuOpen(false)}>
                      {t?.navigation?.register || 'Register'}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
