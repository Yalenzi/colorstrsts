'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { AdminLayout, AdminPageWrapper, AdminGrid, AdminCard, AdminStatsCard } from '../layout/AdminLayout';
import { AdminTable, TableColumn, TableAction } from '../tables/AdminTable';
import { AdminBarChart } from '../charts/AdminCharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  UserPlusIcon,
  ChartBarIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  X,
  EnvelopeIcon,
  CalendarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  role: 'user' | 'admin' | 'moderator';
  subscription: 'free' | 'basic' | 'pro' | 'enterprise';
  testsCount: number;
  joinDate: string;
  lastActive: string;
  location?: string;
  phone?: string;
}

interface EnhancedUserManagementProps {
  lang: Language;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'أحمد محمد علي',
    email: 'ahmed.mohammed@example.com',
    avatar: '',
    status: 'active',
    role: 'user',
    subscription: 'pro',
    testsCount: 45,
    joinDate: '2024-01-15',
    lastActive: '2024-01-21',
    location: 'الرياض، السعودية',
    phone: '+966501234567'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: '',
    status: 'active',
    role: 'admin',
    subscription: 'enterprise',
    testsCount: 128,
    joinDate: '2023-12-10',
    lastActive: '2024-01-21',
    location: 'New York, USA',
    phone: '+1234567890'
  },
  {
    id: '3',
    name: 'محمد عبدالله',
    email: 'mohammed.abdullah@example.com',
    avatar: '',
    status: 'pending',
    role: 'user',
    subscription: 'free',
    testsCount: 3,
    joinDate: '2024-01-20',
    lastActive: '2024-01-20',
    location: 'جدة، السعودية',
    phone: '+966509876543'
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    avatar: '',
    status: 'inactive',
    role: 'moderator',
    subscription: 'basic',
    testsCount: 67,
    joinDate: '2023-11-05',
    lastActive: '2024-01-18',
    location: 'London, UK',
    phone: '+447123456789'
  }
];

const mockStats = {
  totalUsers: 1247,
  activeUsers: 1089,
  newUsersThisMonth: 156,
  premiumUsers: 234
};

const mockUserGrowth = [
  { label: 'يناير', value: 120 },
  { label: 'فبراير', value: 145 },
  { label: 'مارس', value: 167 },
  { label: 'أبريل', value: 189 },
  { label: 'مايو', value: 203 },
  { label: 'يونيو', value: 234 }
];

export function EnhancedUserManagement({ lang }: EnhancedUserManagementProps) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة المستخدمين' : 'User Management',
    description: isRTL ? 'إدارة حسابات المستخدمين والصلاحيات والاشتراكات' : 'Manage user accounts, permissions, and subscriptions',
    totalUsers: isRTL ? 'إجمالي المستخدمين' : 'Total Users',
    activeUsers: isRTL ? 'المستخدمون النشطون' : 'Active Users',
    newUsers: isRTL ? 'مستخدمون جدد' : 'New Users',
    premiumUsers: isRTL ? 'المستخدمون المميزون' : 'Premium Users',
    allUsers: isRTL ? 'جميع المستخدمين' : 'All Users',
    activeTab: isRTL ? 'نشط' : 'Active',
    pendingTab: isRTL ? 'معلق' : 'Pending',
    inactiveTab: isRTL ? 'غير نشط' : 'Inactive',
    addUser: isRTL ? 'إضافة مستخدم' : 'Add User',
    exportData: isRTL ? 'تصدير البيانات' : 'Export Data',
    importData: isRTL ? 'استيراد البيانات' : 'Import Data',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    view: isRTL ? 'عرض' : 'View',
    edit: isRTL ? 'تعديل' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete',
    activate: isRTL ? 'تفعيل' : 'Activate',
    deactivate: isRTL ? 'إلغاء التفعيل' : 'Deactivate',
    userGrowth: isRTL ? 'نمو المستخدمين' : 'User Growth',
    userDetails: isRTL ? 'تفاصيل المستخدم' : 'User Details',
    close: isRTL ? 'إغلاق' : 'Close',
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel'
  };

  const getStatusBadge = (status: User['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      pending: 'outline',
      suspended: 'destructive'
    } as const;

    const labels = {
      active: isRTL ? 'نشط' : 'Active',
      inactive: isRTL ? 'غير نشط' : 'Inactive',
      pending: isRTL ? 'معلق' : 'Pending',
      suspended: isRTL ? 'محظور' : 'Suspended'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getRoleBadge = (role: User['role']) => {
    const variants = {
      admin: 'destructive',
      moderator: 'default',
      user: 'secondary'
    } as const;

    const labels = {
      admin: isRTL ? 'مدير' : 'Admin',
      moderator: isRTL ? 'مشرف' : 'Moderator',
      user: isRTL ? 'مستخدم' : 'User'
    };

    return (
      <Badge variant={variants[role]}>
        {labels[role]}
      </Badge>
    );
  };

  const getSubscriptionBadge = (subscription: User['subscription']) => {
    const variants = {
      free: 'outline',
      basic: 'secondary',
      pro: 'default',
      enterprise: 'destructive'
    } as const;

    const labels = {
      free: isRTL ? 'مجاني' : 'Free',
      basic: isRTL ? 'أساسي' : 'Basic',
      pro: isRTL ? 'احترافي' : 'Pro',
      enterprise: isRTL ? 'مؤسسي' : 'Enterprise'
    };

    return (
      <Badge variant={variants[subscription]}>
        {labels[subscription]}
      </Badge>
    );
  };

  const columns: TableColumn[] = [
    {
      key: 'user',
      label: isRTL ? 'المستخدم' : 'User',
      render: (_, row: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.avatar} alt={row.name} />
            <AvatarFallback>
              {row.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: isRTL ? 'الحالة' : 'Status',
      render: (value: User['status']) => getStatusBadge(value),
      sortable: true
    },
    {
      key: 'role',
      label: isRTL ? 'الدور' : 'Role',
      render: (value: User['role']) => getRoleBadge(value),
      sortable: true
    },
    {
      key: 'subscription',
      label: isRTL ? 'الاشتراك' : 'Subscription',
      render: (value: User['subscription']) => getSubscriptionBadge(value),
      sortable: true
    },
    {
      key: 'testsCount',
      label: isRTL ? 'الاختبارات' : 'Tests',
      align: 'center',
      sortable: true
    },
    {
      key: 'joinDate',
      label: isRTL ? 'تاريخ الانضمام' : 'Join Date',
      render: (value: string) => new Date(value).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US'),
      sortable: true
    }
  ];

  const actions: TableAction[] = [
    {
      label: texts.view,
      icon: <EyeIcon className="h-4 w-4" />,
      onClick: (row: User) => {
        setSelectedUser(row);
        setShowViewModal(true);
      }
    },
    {
      label: texts.edit,
      icon: <PencilIcon className="h-4 w-4" />,
      onClick: (row: User) => {
        console.log('Edit user:', row);
      }
    },
    {
      label: texts.delete,
      icon: <TrashIcon className="h-4 w-4" />,
      variant: 'destructive',
      onClick: (row: User) => {
        console.log('Delete user:', row);
      }
    }
  ];

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    toast.success(isRTL ? 'تم تحديث البيانات' : 'Data refreshed');
  };

  const filteredUsers = users.filter(user => {
    if (activeTab === 'all') return true;
    return user.status === activeTab;
  });

  return (
    <AdminLayout lang={lang}>
      <AdminPageWrapper
        title={texts.title}
        description={texts.description}
        lang={lang}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              {texts.exportData}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {texts.refresh}
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              {texts.addUser}
            </Button>
          </div>
        }
      >
        {/* Stats Overview */}
        <AdminGrid cols="4" gap="normal">
          <AdminStatsCard
            title={texts.totalUsers}
            value={mockStats.totalUsers.toLocaleString()}
            change="+12.5%"
            changeType="positive"
            icon={<UsersIcon className="h-6 w-6 text-blue-600" />}
            lang={lang}
          />
          <AdminStatsCard
            title={texts.activeUsers}
            value={mockStats.activeUsers.toLocaleString()}
            change="+8.2%"
            changeType="positive"
            icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />}
            lang={lang}
          />
          <AdminStatsCard
            title={texts.newUsers}
            value={mockStats.newUsersThisMonth}
            change="+23"
            changeType="positive"
            icon={<UserPlusIcon className="h-6 w-6 text-purple-600" />}
            lang={lang}
          />
          <AdminStatsCard
            title={texts.premiumUsers}
            value={mockStats.premiumUsers}
            change="+15.3%"
            changeType="positive"
            icon={<CreditCardIcon className="h-6 w-6 text-yellow-600" />}
            lang={lang}
          />
        </AdminGrid>

        {/* User Growth Chart */}
        <AdminBarChart
          data={mockUserGrowth}
          title={texts.userGrowth}
          description={isRTL ? 'نمو المستخدمين خلال الأشهر الستة الماضية' : 'User growth over the past 6 months'}
          lang={lang}
        />

        {/* Users Table with Tabs */}
        <AdminCard title={texts.allUsers} padding="none">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6 border-b border-gray-200 dark:border-gray-700">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">{texts.allUsers}</TabsTrigger>
                <TabsTrigger value="active">{texts.activeTab}</TabsTrigger>
                <TabsTrigger value="pending">{texts.pendingTab}</TabsTrigger>
                <TabsTrigger value="inactive">{texts.inactiveTab}</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={activeTab} className="mt-0">
              <AdminTable
                data={filteredUsers}
                columns={columns}
                actions={actions}
                loading={loading}
                lang={lang}
                className="border-0"
              />
            </TabsContent>
          </Tabs>
        </AdminCard>

        {/* User Details Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-white bg-opacity-95 dark:bg-gray-900 dark:bg-opacity-95 flex items-center justify-center z-50 p-4">
            <AdminCard 
              title={texts.userDetails}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700"
              actions={
                <Button variant="ghost" size="sm" onClick={() => setShowViewModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              }
            >
              <div className="space-y-6">
                {/* User Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                    <AvatarFallback className="text-lg">
                      {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {selectedUser.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedUser.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(selectedUser.status)}
                      {getRoleBadge(selectedUser.role)}
                      {getSubscriptionBadge(selectedUser.subscription)}
                    </div>
                  </div>
                </div>

                {/* User Stats */}
                <AdminGrid cols="3" gap="tight">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <BeakerIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedUser.testsCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {isRTL ? 'اختبار' : 'Tests'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {Math.floor((new Date().getTime() - new Date(selectedUser.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {isRTL ? 'يوم' : 'Days'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <ClockIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {Math.floor((new Date().getTime() - new Date(selectedUser.lastActive).getTime()) / (1000 * 60 * 60))}h
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {isRTL ? 'آخر نشاط' : 'Last Active'}
                    </div>
                  </div>
                </AdminGrid>

                {/* User Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedUser.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? 'رقم الهاتف' : 'Phone'}
                    </label>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm">{selectedUser.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? 'الموقع' : 'Location'}
                    </label>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm">{selectedUser.location || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? 'تاريخ الانضمام' : 'Join Date'}
                    </label>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {new Date(selectedUser.joinDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" onClick={() => setShowViewModal(false)}>
                    {texts.close}
                  </Button>
                  <Button>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    {texts.edit}
                  </Button>
                </div>
              </div>
            </AdminCard>
          </div>
        )}
      </AdminPageWrapper>
    </AdminLayout>
  );
}
