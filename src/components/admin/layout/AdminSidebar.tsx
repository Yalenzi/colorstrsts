'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  HomeIcon,
  UsersIcon,
  BeakerIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface AdminSidebarProps {
  lang: Language;
  className?: string;
}

interface NavItem {
  id: string;
  label_en: string;
  label_ar: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label_en: 'Dashboard',
    label_ar: 'لوحة التحكم',
    href: '/admin',
    icon: HomeIcon
  },
  {
    id: 'users',
    label_en: 'Users',
    label_ar: 'المستخدمون',
    href: '/admin/users',
    icon: UsersIcon,
    badge: { text: '156', variant: 'secondary' }
  },
  {
    id: 'tests',
    label_en: 'Tests',
    label_ar: 'الاختبارات',
    href: '/admin/tests',
    icon: BeakerIcon,
    badge: { text: '35', variant: 'default' }
  },
  {
    id: 'subscriptions',
    label_en: 'Subscriptions',
    label_ar: 'الاشتراكات',
    href: '/admin/subscriptions',
    icon: CreditCardIcon,
    badge: { text: '24', variant: 'outline' }
  },
  {
    id: 'reports',
    label_en: 'Reports',
    label_ar: 'التقارير',
    href: '/admin/reports',
    icon: DocumentTextIcon
  },
  {
    id: 'analytics',
    label_en: 'Analytics',
    label_ar: 'التحليلات',
    href: '/admin/analytics',
    icon: ChartBarIcon,
    badge: { text: 'New', variant: 'destructive' }
  },
  {
    id: 'security',
    label_en: 'Security',
    label_ar: 'الأمان',
    href: '/admin/security',
    icon: ShieldCheckIcon
  },
  {
    id: 'notifications',
    label_en: 'Notifications',
    label_ar: 'الإشعارات',
    href: '/admin/notifications',
    icon: BellIcon,
    badge: { text: '3', variant: 'destructive' }
  },
  {
    id: 'settings',
    label_en: 'Settings',
    label_ar: 'الإعدادات',
    href: '/admin/settings',
    icon: CogIcon
  },
  {
    id: 'help',
    label_en: 'Help & Support',
    label_ar: 'المساعدة والدعم',
    href: '/admin/help',
    icon: QuestionMarkCircleIcon
  }
];

export function AdminSidebar({ lang, className = '' }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const isRTL = lang === 'ar';

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white shadow-md"
      >
        {isMobileOpen ? (
          <XMarkIcon className="h-5 w-5" />
        ) : (
          <Bars3Icon className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          admin-sidebar
          ${isCollapsed ? 'collapsed' : ''}
          ${isMobileOpen ? 'mobile-open' : ''}
          ${isRTL ? 'rtl' : 'ltr'}
          ${className}
        `}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Sidebar Header */}
        <div className="admin-sidebar-header">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <BeakerIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {isRTL ? 'إدارة الاختبارات' : 'Chemical Tests'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isRTL ? 'لوحة التحكم' : 'Admin Panel'}
                </span>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <BeakerIcon className="h-5 w-5 text-white" />
            </div>
          )}

          {/* Collapse Toggle - Desktop Only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="hidden lg:flex absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md"
            style={{ [isRTL ? 'left' : 'right']: '-12px' }}
          >
            {isCollapsed ? (
              isRTL ? <ChevronLeftIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />
            ) : (
              isRTL ? <ChevronRightIcon className="h-3 w-3" /> : <ChevronLeftIcon className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <nav className="admin-sidebar-nav space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  admin-nav-item group
                  ${isActiveRoute(item.href) ? 'active' : ''}
                `}
                title={!isCollapsed ? undefined : (isRTL ? item.label_ar : item.label_en)}
              >
                <item.icon className="admin-nav-icon" />
                
                {!isCollapsed && (
                  <>
                    <span className="admin-nav-text flex-1">
                      {isRTL ? item.label_ar : item.label_en}
                    </span>
                    
                    {item.badge && (
                      <Badge 
                        variant={item.badge.variant} 
                        className="text-xs px-2 py-0.5 ml-auto"
                      >
                        {item.badge.text}
                      </Badge>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {isRTL ? item.label_ar : item.label_en}
                    {item.badge && (
                      <span className="ml-2 px-1 py-0.5 bg-gray-700 rounded text-xs">
                        {item.badge.text}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          {!isCollapsed ? (
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {isRTL ? 'الإصدار' : 'Version'} 2.0.0
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {isRTL ? 'نظام إدارة الاختبارات الكيميائية' : 'Chemical Tests Management'}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="System Online" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// Hook for sidebar state
export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(newState));
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return {
    isCollapsed,
    isMobileOpen,
    toggleCollapsed,
    toggleMobile,
    setIsMobileOpen
  };
}
