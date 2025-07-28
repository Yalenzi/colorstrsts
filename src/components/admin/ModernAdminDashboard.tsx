'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UsersIcon,
  BeakerIcon,
  CreditCardIcon,
  ChartBarIcon,
  EyeIcon,
  PlusIcon,
  ArrowPathIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { EnhancedCharts } from './charts/EnhancedCharts';
import ColorResultsManagement from './ColorResultsManagement';
import { TestStepsManagement } from './TestStepsManagement';
import { SubscriptionManagement } from './SubscriptionManagement';
import { SubscriptionPlansManagement } from './SubscriptionPlansManagement';
import { TextEditorManagement } from './TextEditorManagement';
import DataImportExport from './DataImportExport';
import SystemStatistics from './SystemStatistics';
import { EnhancedTestsManagement } from './EnhancedTestsManagement';
import { ContentManagement } from './ContentManagement';
import { ComprehensiveUserManagement } from './ComprehensiveUserManagement';
import { AdminRoleFixer } from './AdminRoleFixer';
import { EnhancedAdminRoleFixer } from './EnhancedAdminRoleFixer';
import { EnhancedSystemSettings } from './EnhancedSystemSettings';
import { PerformanceSettings } from './PerformanceSettings';
import { NotificationSettings } from './NotificationSettings';
import { DatabaseSettings } from './DatabaseSettings';
import { SecuritySettings } from './SecuritySettings';
import { PaymentGatewaysManagement } from './PaymentGatewaysManagement';
import { EnhancedPaymentManagement } from './EnhancedPaymentManagement';
import { UserUpdateDiagnostic } from './UserUpdateDiagnostic';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ModernAdminDashboardProps {
  lang: Language;
}

interface User {
  id: string;
  name?: string;
  displayName?: string;
  email: string;
  status?: 'active' | 'inactive' | 'pending';
  role?: 'admin' | 'user' | 'moderator';
  joinDate?: string;
  createdAt?: any;
  testsCount?: number;
  photoURL?: string;
  emailVerified?: boolean;
  lastLoginAt?: any;
  subscription?: {
    plan: string;
    status: string;
    expiresAt?: any;
  };
}

export function ModernAdminDashboard({ lang }: ModernAdminDashboardProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const isRTL = lang === 'ar';

  // Additional security check
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = auth.currentUser;
      console.log('[ADMIN DASHBOARD] Security check:', { currentUser: !!currentUser });

      if (!currentUser) {
        console.warn('[ADMIN DASHBOARD] No authenticated user, redirecting to login');
        router.push(`/${lang}/admin/login`);
        return;
      }

      // Check admin email whitelist
      const adminEmails = ['aburakan4551@gmail.com', 'admin@colorstest.com'];
      if (!adminEmails.includes(currentUser.email || '')) {
        console.warn('[ADMIN DASHBOARD] Email not in admin whitelist:', currentUser.email);
        router.push(`/${lang}/admin/login`);
        return;
      }

      console.log('[ADMIN DASHBOARD] Security check passed');
    };

    checkAuth();
  }, [lang, router]);

  const texts = {
    dashboard: isRTL ? 'لوحة التحكم' : 'Dashboard',
    users: isRTL ? 'المستخدمون' : 'Users',
    tests: isRTL ? 'الاختبارات' : 'Tests',
    reports: isRTL ? 'التقارير' : 'Reports',
    settings: isRTL ? 'الإعدادات' : 'Settings',
    totalUsers: isRTL ? 'إجمالي المستخدمين' : 'Total Users',
    activeUsers: isRTL ? 'المستخدمون النشطون' : 'Active Users',
    totalTests: isRTL ? 'إجمالي الاختبارات' : 'Total Tests',
    monthlyRevenue: isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue',
    search: isRTL ? 'البحث...' : 'Search...',
    addUser: isRTL ? 'إضافة مستخدم' : 'Add User',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    active: isRTL ? 'نشط' : 'Active',
    inactive: isRTL ? 'غير نشط' : 'Inactive',
    pending: isRTL ? 'معلق' : 'Pending',
    admin: isRTL ? 'مدير' : 'Admin',
    user: isRTL ? 'مستخدم' : 'User',
    moderator: isRTL ? 'مشرف' : 'Moderator',
    name: isRTL ? 'الاسم' : 'Name',
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    status: isRTL ? 'الحالة' : 'Status',
    role: isRTL ? 'الدور' : 'Role',
    actions: isRTL ? 'الإجراءات' : 'Actions',
    view: isRTL ? 'عرض' : 'View',
    edit: isRTL ? 'تعديل' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete'
  };

  // Firebase data fetching
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const usersData: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            id: doc.id,
            name: data.displayName || data.name || 'مستخدم غير محدد',
            displayName: data.displayName,
            email: data.email,
            status: data.status || (data.emailVerified ? 'active' : 'pending'),
            role: data.role || 'user',
            joinDate: data.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0],
            createdAt: data.createdAt,
            testsCount: data.testsCount || 0,
            photoURL: data.photoURL,
            emailVerified: data.emailVerified,
            lastLoginAt: data.lastLoginAt,
            subscription: data.subscription
          });
        });
        setUsers(usersData);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      // Fallback to empty array if Firebase fails
      setUsers([]);
    }
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalTests: 35, // This could be fetched from tests collection
    monthlyRevenue: 12450 // This could be calculated from subscriptions
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeUsers = async () => {
      unsubscribe = await fetchUsers();
    };

    initializeUsers();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('admin-dark-mode', (!darkMode).toString());
  };

  const handleRefresh = async () => {
    await fetchUsers();
  };

  // User management handlers
  const handleViewUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const userInfo = `
${isRTL ? 'معلومات المستخدم:' : 'User Information:'}
${isRTL ? 'الاسم:' : 'Name:'} ${user.name || user.displayName || 'غير محدد'}
${isRTL ? 'البريد الإلكتروني:' : 'Email:'} ${user.email}
${isRTL ? 'الدور:' : 'Role:'} ${user.role || 'user'}
${isRTL ? 'الحالة:' : 'Status:'} ${user.status || 'pending'}
${isRTL ? 'تاريخ الانضمام:' : 'Join Date:'} ${user.joinDate || 'غير محدد'}
${isRTL ? 'عدد الاختبارات:' : 'Tests Count:'} ${user.testsCount || 0}
      `;
      alert(userInfo);
      // TODO: Implement user details modal
    }
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newName = prompt(
        `${isRTL ? 'تعديل اسم المستخدم:' : 'Edit user name:'}`,
        user.name || user.displayName || ''
      );

      if (newName && newName.trim()) {
        alert(`${isRTL ? 'سيتم تحديث الاسم إلى:' : 'Name will be updated to:'} ${newName}`);
        // TODO: Implement user update functionality
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const confirmMessage = isRTL
        ? `⚠️ تحذير: هل أنت متأكد من حذف المستخدم؟\n\nالاسم: ${user.name || user.displayName || user.email}\nالبريد الإلكتروني: ${user.email}\n\nهذا الإجراء لا يمكن التراجع عنه!`
        : `⚠️ Warning: Are you sure you want to delete this user?\n\nName: ${user.name || user.displayName || user.email}\nEmail: ${user.email}\n\nThis action cannot be undone!`;

      if (confirm(confirmMessage)) {
        alert(`${isRTL ? '✅ سيتم حذف المستخدم:' : '✅ User will be deleted:'} ${user.name || user.displayName || user.email}`);
        // TODO: Implement user deletion with Firebase
      }
    }
  };

  const getStatusBadge = (status?: User['status']) => {
    const currentStatus = status || 'pending';
    const variants = {
      active: 'default',
      inactive: 'secondary',
      pending: 'outline'
    } as const;

    // إضافة حماية من undefined
    const variant = variants[currentStatus as keyof typeof variants] || 'outline';

    return (
      <Badge variant={variant}>
        {currentStatus === 'active' ? texts.active : currentStatus === 'inactive' ? texts.inactive : texts.pending}
      </Badge>
    );
  };

  const getRoleBadge = (role?: User['role']) => {
    const currentRole = role || 'user';
    const variants = {
      admin: 'destructive',
      moderator: 'default',
      user: 'secondary',
      super_admin: 'destructive' // إضافة super_admin
    } as const;

    // إضافة حماية من undefined
    const variant = variants[currentRole as keyof typeof variants] || 'secondary';

    return (
      <Badge variant={variant}>
        {currentRole === 'admin' ? texts.admin :
         currentRole === 'super_admin' ? (isRTL ? 'مدير عام' : 'Super Admin') :
         currentRole === 'moderator' ? texts.moderator : texts.user}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const name = user.name || user.displayName || '';
    const email = user.email || '';
    const searchLower = searchQuery.toLowerCase();

    return name.toLowerCase().includes(searchLower) ||
           email.toLowerCase().includes(searchLower);
  });

  const sidebarItems = [
    { id: 'dashboard', label: texts.dashboard, icon: HomeIcon },
    { id: 'users', label: texts.users, icon: UsersIcon },
    { id: 'tests', label: texts.tests, icon: BeakerIcon },
    { id: 'color-results', label: isRTL ? 'النتائج اللونية' : 'Color Results', icon: BeakerIcon },
    { id: 'test-steps', label: isRTL ? 'خطوات الاختبار' : 'Test Steps', icon: DocumentTextIcon },
    { id: 'subscriptions', label: isRTL ? 'الاشتراكات' : 'Subscriptions', icon: CreditCardIcon },
    { id: 'subscription-plans', label: isRTL ? 'خطط الاشتراك' : 'Subscription Plans', icon: CreditCardIcon },
    { id: 'payment-gateways', label: isRTL ? 'بوابات الدفع' : 'Payment Gateways', icon: CreditCardIcon },
    { id: 'enhanced-payments', label: isRTL ? 'إدارة المدفوعات المتقدمة' : 'Enhanced Payments', icon: BanknotesIcon },
    { id: 'user-diagnostic', label: isRTL ? 'تشخيص مشاكل المستخدمين' : 'User Diagnostic', icon: CogIcon },
    { id: 'content', label: isRTL ? 'إدارة المحتوى' : 'Content Management', icon: DocumentTextIcon },
    { id: 'content-management', label: isRTL ? 'إدارة الاشتراكات والدفع' : 'Subscription & Payment Management', icon: CreditCardIcon },
    { id: 'admin-roles', label: isRTL ? 'إصلاح أدوار المديرين' : 'Fix Admin Roles', icon: ShieldCheckIcon },
    { id: 'database', label: isRTL ? 'إدارة البيانات' : 'Database Management', icon: ShieldCheckIcon },
    { id: 'reports', label: texts.reports, icon: ChartBarIcon },
    { id: 'settings', label: texts.settings, icon: CogIcon }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300 ${darkMode ? 'dark' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className={`
        fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 z-30 flex flex-col
        ${sidebarOpen ? 'w-64' : 'w-16'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <BeakerIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white text-sm">
                  {isRTL ? 'إدارة الاختبارات' : 'Chemical Tests'}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isRTL ? 'لوحة التحكم' : 'Admin Panel'}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
          >
            {sidebarOpen ? <XMarkIcon className="h-4 w-4" /> : <Bars3Icon className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="p-2 flex-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mb-1
                ${activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`
        transition-all duration-300 min-h-screen overflow-y-auto
        ${sidebarOpen ? (isRTL ? 'mr-64' : 'ml-64') : (isRTL ? 'mr-16' : 'ml-16')}
      `}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {isRTL ? 'إدارة وتحكم شامل في النظام' : 'Comprehensive system management and control'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2"
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </Button>
              
              <Button variant="ghost" size="sm" className="p-2">
                <BellIcon className="h-5 w-5" />
              </Button>
              
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-h-screen overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {texts.totalUsers}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                          {stats.totalUsers.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600 mt-1">+12.5%</p>
                      </div>
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <UsersIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {texts.activeUsers}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                          {stats.activeUsers.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600 mt-1">+8.2%</p>
                      </div>
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {texts.totalTests}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                          {stats.totalTests}
                        </p>
                        <p className="text-sm text-green-600 mt-1">+3</p>
                      </div>
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <BeakerIcon className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {texts.monthlyRevenue}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                          ${stats.monthlyRevenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600 mt-1">+15.3%</p>
                      </div>
                      <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>{isRTL ? 'النشاط الحديث' : 'Recent Activity'}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'آخر الأنشطة في النظام' : 'Latest system activities'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          U
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {isRTL ? 'مستخدم جديد انضم للنظام' : 'New user joined the system'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isRTL ? 'منذ 5 دقائق' : '5 minutes ago'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'users' && (
            <ComprehensiveUserManagement lang={lang} />
          )}

          {activeTab === 'admin-roles' && (
            <EnhancedAdminRoleFixer lang={lang} />
          )}

          {activeTab === 'users-old' && (
            <div className="space-y-6">
              {/* Users Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {texts.totalUsers}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                          {stats.totalUsers}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <UsersIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {texts.activeUsers}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                          {stats.activeUsers}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {isRTL ? 'مستخدمون جدد' : 'New Users'}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                          {users.filter(u => new Date(u.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Users Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={texts.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {texts.refresh}
                  </Button>
                  <Button size="sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {texts.addUser}
                  </Button>
                </div>
              </div>

              {/* Users Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {texts.name}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {texts.email}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {texts.status}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {texts.role}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {texts.actions}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {user.photoURL ? (
                                  <img
                                    src={user.photoURL}
                                    alt={user.name || user.displayName || 'User'}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {(user.name || user.displayName || user.email)?.charAt(0)?.toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {user.name || user.displayName || user.email?.split('@')[0]}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.testsCount || 0} {isRTL ? 'اختبار' : 'tests'}
                                    {user.subscription && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        {user.subscription.plan}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(user.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getRoleBadge(user.role)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewUser(user.id)}
                                  title={isRTL ? 'عرض المستخدم' : 'View User'}
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditUser(user.id)}
                                  title={isRTL ? 'تعديل المستخدم' : 'Edit User'}
                                >
                                  {texts.edit}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteUser(user.id)}
                                  title={isRTL ? 'حذف المستخدم' : 'Delete User'}
                                >
                                  {texts.delete}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'tests' && (
            <EnhancedTestsManagement lang={lang} />
          )}

          {activeTab === 'color-results' && (
            <ColorResultsManagement isRTL={isRTL} lang={lang} />
          )}

          {activeTab === 'test-steps' && (
            <TestStepsManagement lang={lang} />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionManagement isRTL={isRTL} lang={lang} />
          )}

          {activeTab === 'subscription-plans' && (
            <SubscriptionPlansManagement isRTL={isRTL} lang={lang} />
          )}

          {activeTab === 'content' && (
            <TextEditorManagement isRTL={isRTL} lang={lang} />
          )}

          {activeTab === 'content-management' && (
            <ContentManagement lang={lang} />
          )}

          {activeTab === 'database' && (
            <DataImportExport />
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <EnhancedCharts lang={lang} />
              <SystemStatistics />
            </div>
          )}

          {activeTab === 'settings' && (
            <EnhancedSystemSettings lang={lang} />
          )}

          {activeTab === 'admin-roles' && (
            <EnhancedAdminRoleFixer lang={lang} />
          )}

          {activeTab === 'performance' && (
            <PerformanceSettings lang={lang} />
          )}

          {activeTab === 'notifications' && (
            <NotificationSettings lang={lang} />
          )}

          {activeTab === 'database' && (
            <DatabaseSettings lang={lang} />
          )}

          {activeTab === 'security' && (
            <SecuritySettings lang={lang} />
          )}

          {activeTab === 'payment-gateways' && (
            <PaymentGatewaysManagement lang={lang} />
          )}

          {activeTab === 'enhanced-payments' && (
            <EnhancedPaymentManagement lang={lang} />
          )}

          {activeTab === 'user-diagnostic' && (
            <UserUpdateDiagnostic lang={lang} />
          )}

          {/* Other tabs content */}
          {!['dashboard', 'users', 'tests', 'color-results', 'test-steps', 'subscriptions', 'subscription-plans', 'content', 'database', 'reports', 'settings', 'admin-roles', 'performance', 'notifications', 'security', 'payment-gateways', 'enhanced-payments', 'user-diagnostic'].includes(activeTab) && (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {sidebarItems.find(item => item.id === activeTab)?.label}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isRTL ? 'هذا القسم قيد التطوير' : 'This section is under development'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
