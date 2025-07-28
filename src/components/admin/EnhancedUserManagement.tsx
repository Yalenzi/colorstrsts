'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Language } from '@/types';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  TestTube, 
  Crown,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Filter,
  Download,
  Upload,
  MoreVertical,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
  joinDate: string;
  lastActive: string;
  testsCount: number;
  subscriptionStatus: 'free' | 'premium' | 'expired';
  subscriptionExpiry?: string;
  status: 'active' | 'inactive' | 'banned';
  role: 'user' | 'admin' | 'super_admin';
}

interface EnhancedUserManagementProps {
  lang: Language;
}

export function EnhancedUserManagement({ lang }: EnhancedUserManagementProps) {
  const isRTL = lang === 'ar';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('joinDate');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // محاكاة تحميل المستخدمين من قاعدة البيانات
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'ahmed@example.com',
          name: 'أحمد محمد',
          joinDate: '2024-01-15',
          lastActive: '2024-01-20',
          testsCount: 25,
          subscriptionStatus: 'premium',
          subscriptionExpiry: '2024-02-15',
          status: 'active',
          role: 'user'
        },
        {
          id: '2',
          email: 'sara@example.com',
          name: 'سارة أحمد',
          joinDate: '2024-01-10',
          lastActive: '2024-01-19',
          testsCount: 12,
          subscriptionStatus: 'free',
          status: 'active',
          role: 'user'
        },
        {
          id: '3',
          email: 'admin@example.com',
          name: 'مدير النظام',
          joinDate: '2023-12-01',
          lastActive: '2024-01-21',
          testsCount: 156,
          subscriptionStatus: 'premium',
          status: 'active',
          role: 'admin'
        },
        {
          id: '4',
          email: 'omar@example.com',
          name: 'عمر خالد',
          joinDate: '2024-01-05',
          lastActive: '2024-01-18',
          testsCount: 8,
          subscriptionStatus: 'expired',
          subscriptionExpiry: '2024-01-10',
          status: 'inactive',
          role: 'user'
        },
        {
          id: '5',
          email: 'fatima@example.com',
          name: 'فاطمة علي',
          joinDate: '2024-01-12',
          lastActive: '2024-01-21',
          testsCount: 34,
          subscriptionStatus: 'premium',
          subscriptionExpiry: '2024-03-12',
          status: 'active',
          role: 'user'
        }
      ];

      setUsers(mockUsers);
      toast.success(isRTL ? 'تم تحميل المستخدمين بنجاح' : 'Users loaded successfully');
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(isRTL ? 'خطأ في تحميل المستخدمين' : 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  // تصفية المستخدمين
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // إضافة مستخدم جديد
  const handleAddUser = () => {
    setShowAddModal(true);
  };

  // تعديل مستخدم
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  // عرض تفاصيل المستخدم
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // حذف مستخدم
  const handleDeleteUser = (userId: string) => {
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      toast.success(isRTL ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully');

      // حفظ في localStorage
      const updatedUsers = users.filter(user => user.id !== userId);
      localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    }
  };

  // تغيير حالة المستخدم
  const handleToggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    );
    setUsers(updatedUsers);

    // حفظ في localStorage
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));

    toast.success(isRTL ? 'تم تغيير حالة المستخدم' : 'User status changed');
  };

  // تحديث قائمة المستخدمين
  const handleRefreshUsers = () => {
    setLoading(true);
    // محاكاة تحديث البيانات
    setTimeout(() => {
      loadUsers();
      setLoading(false);
      toast.success(isRTL ? 'تم تحديث قائمة المستخدمين' : 'Users list refreshed');
    }, 1000);
  };

  // رندر شارة الحالة مع حماية من undefined
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: isRTL ? 'نشط' : 'Active' },
      inactive: { color: 'bg-yellow-100 text-yellow-800', text: isRTL ? 'غير نشط' : 'Inactive' },
      banned: { color: 'bg-red-100 text-red-800', text: isRTL ? 'محظور' : 'Banned' }
    };

    // إضافة حماية من undefined مع قيمة افتراضية
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

    if (!config) {
      // fallback إضافي في حالة عدم وجود أي config
      return (
        <Badge className="bg-gray-100 text-gray-800">
          {isRTL ? 'غير محدد' : 'Unknown'}
        </Badge>
      );
    }

    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  // رندر شارة الاشتراك مع حماية من undefined
  const renderSubscriptionBadge = (status: string) => {
    const statusConfig = {
      premium: { color: 'bg-purple-100 text-purple-800', text: isRTL ? 'مميز' : 'Premium', icon: Crown },
      free: { color: 'bg-gray-100 text-gray-800', text: isRTL ? 'مجاني' : 'Free', icon: Users },
      expired: { color: 'bg-red-100 text-red-800', text: isRTL ? 'منتهي' : 'Expired', icon: X }
    };

    // إضافة حماية من undefined مع قيمة افتراضية
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.free;

    if (!config) {
      // fallback إضافي في حالة عدم وجود أي config
      return (
        <Badge className="bg-gray-100 text-gray-800 flex items-center space-x-1 rtl:space-x-reverse">
          <Users className="w-3 h-3" />
          <span>{isRTL ? 'غير محدد' : 'Unknown'}</span>
        </Badge>
      );
    }

    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1 rtl:space-x-reverse`}>
        <IconComponent className="w-3 h-3" />
        <span>{config.text}</span>
      </Badge>
    );
  };

  // رندر شارة الدور مع حماية من undefined
  const renderRoleBadge = (role: string) => {
    const roleConfig = {
      user: { color: 'bg-blue-100 text-blue-800', text: isRTL ? 'مستخدم' : 'User' },
      admin: { color: 'bg-orange-100 text-orange-800', text: isRTL ? 'مدير' : 'Admin' },
      super_admin: { color: 'bg-red-100 text-red-800', text: isRTL ? 'مدير عام' : 'Super Admin' }
    };

    // إضافة حماية من undefined مع قيمة افتراضية
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;

    if (!config) {
      // fallback إضافي في حالة عدم وجود أي config
      return (
        <Badge className="bg-gray-100 text-gray-800">
          {isRTL ? 'غير محدد' : 'Unknown'}
        </Badge>
      );
    }

    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isRTL ? 'إدارة المستخدمين' : 'User Management'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? 'إدارة وتنظيم حسابات المستخدمين' : 'Manage and organize user accounts'}
          </p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? 'إضافة مستخدم' : 'Add User'}
          </Button>
          <Button
            onClick={handleRefreshUsers}
            variant="outline"
            disabled={loading}
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <UserCheck className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? 'استيراد' : 'Import'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isRTL ? 'إجمالي المستخدمين' : 'Total Users'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {users.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isRTL ? 'المستخدمين النشطين' : 'Active Users'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isRTL ? 'المشتركين المميزين' : 'Premium Users'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {users.filter(u => u.subscriptionStatus === 'premium').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isRTL ? 'المديرين' : 'Admins'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <Users className="w-5 h-5" />
              <span>{isRTL ? 'قائمة المستخدمين' : 'Users List'}</span>
            </CardTitle>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="relative">
                <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={isRTL ? 'البحث عن مستخدم...' : 'Search users...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rtl:pr-10 rtl:pl-3 w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                <option value="inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
                <option value="banned">{isRTL ? 'محظور' : 'Banned'}</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 rtl:mr-2 rtl:ml-0 text-gray-600 dark:text-gray-400">
                {isRTL ? 'جاري التحميل...' : 'Loading...'}
              </span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{isRTL ? 'لا توجد مستخدمين' : 'No users found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className={`py-3 px-4 text-left rtl:text-right font-medium text-gray-500 dark:text-gray-400`}>
                      {isRTL ? 'المستخدم' : 'User'}
                    </th>
                    <th className={`py-3 px-4 text-left rtl:text-right font-medium text-gray-500 dark:text-gray-400`}>
                      {isRTL ? 'الحالة' : 'Status'}
                    </th>
                    <th className={`py-3 px-4 text-left rtl:text-right font-medium text-gray-500 dark:text-gray-400`}>
                      {isRTL ? 'الاشتراك' : 'Subscription'}
                    </th>
                    <th className={`py-3 px-4 text-left rtl:text-right font-medium text-gray-500 dark:text-gray-400`}>
                      {isRTL ? 'الدور' : 'Role'}
                    </th>
                    <th className={`py-3 px-4 text-left rtl:text-right font-medium text-gray-500 dark:text-gray-400`}>
                      {isRTL ? 'الاختبارات' : 'Tests'}
                    </th>
                    <th className={`py-3 px-4 text-left rtl:text-right font-medium text-gray-500 dark:text-gray-400`}>
                      {isRTL ? 'تاريخ الانضمام' : 'Join Date'}
                    </th>
                    <th className={`py-3 px-4 text-left rtl:text-right font-medium text-gray-500 dark:text-gray-400`}>
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {user.name || isRTL ? 'غير محدد' : 'Not specified'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {renderStatusBadge(user.status)}
                      </td>
                      <td className="py-4 px-4">
                        {renderSubscriptionBadge(user.subscriptionStatus)}
                      </td>
                      <td className="py-4 px-4">
                        {renderRoleBadge(user.role)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <TestTube className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {user.testsCount}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(user.joinDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                            title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title={isRTL ? 'تعديل' : 'Edit'}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={user.status === 'active' ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                            title={user.status === 'active' ? (isRTL ? 'إلغاء التفعيل' : 'Deactivate') : (isRTL ? 'تفعيل' : 'Activate')}
                          >
                            {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title={isRTL ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals will be added here */}
      {showAddModal && (
        <div className="fixed inset-0 bg-white bg-opacity-95 dark:bg-gray-900 dark:bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {isRTL ? 'إضافة مستخدم جديد' : 'Add New User'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <Input placeholder={isRTL ? 'الاسم' : 'Name'} />
              <Input placeholder={isRTL ? 'البريد الإلكتروني' : 'Email'} type="email" />
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="user">{isRTL ? 'مستخدم' : 'User'}</option>
                <option value="admin">{isRTL ? 'مدير' : 'Admin'}</option>
              </select>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button
                  onClick={() => {
                    setShowAddModal(false);
                    toast.success(isRTL ? 'تم إضافة المستخدم بنجاح' : 'User added successfully');
                  }}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {isRTL ? 'حفظ' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {isRTL ? 'تعديل المستخدم' : 'Edit User'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <Input defaultValue={selectedUser.name} placeholder={isRTL ? 'الاسم' : 'Name'} />
              <Input defaultValue={selectedUser.email} placeholder={isRTL ? 'البريد الإلكتروني' : 'Email'} type="email" />
              <select defaultValue={selectedUser.role} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="user">{isRTL ? 'مستخدم' : 'User'}</option>
                <option value="admin">{isRTL ? 'مدير' : 'Admin'}</option>
                <option value="super_admin">{isRTL ? 'مدير عام' : 'Super Admin'}</option>
              </select>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    toast.success(isRTL ? 'تم تحديث المستخدم بنجاح' : 'User updated successfully');
                  }}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-white bg-opacity-95 dark:bg-gray-900 dark:bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {isRTL ? 'تفاصيل المستخدم' : 'User Details'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedUser(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                    {selectedUser.name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedUser.name || (isRTL ? 'غير محدد' : 'Not specified')}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                    {renderStatusBadge(selectedUser.status)}
                    {renderSubscriptionBadge(selectedUser.subscriptionStatus)}
                    {renderRoleBadge(selectedUser.role)}
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? 'تاريخ الانضمام' : 'Join Date'}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(selectedUser.joinDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? 'آخر نشاط' : 'Last Active'}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(selectedUser.lastActive).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? 'عدد الاختبارات' : 'Tests Count'}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100 flex items-center">
                      <TestTube className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
                      {selectedUser.testsCount}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? 'حالة الحساب' : 'Account Status'}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {renderStatusBadge(selectedUser.status)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? 'نوع الاشتراك' : 'Subscription Type'}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {renderSubscriptionBadge(selectedUser.subscriptionStatus)}
                    </p>
                  </div>
                  {selectedUser.subscriptionExpiry && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {isRTL ? 'انتهاء الاشتراك' : 'Subscription Expiry'}
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {new Date(selectedUser.subscriptionExpiry).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? 'الدور' : 'Role'}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {renderRoleBadge(selectedUser.role)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 rtl:space-x-reverse pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditUser(selectedUser);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {isRTL ? 'تعديل المستخدم' : 'Edit User'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1"
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
