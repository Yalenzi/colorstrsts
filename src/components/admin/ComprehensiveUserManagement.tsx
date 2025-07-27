'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { auth, db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon as SearchIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserIcon,
  ArrowPathIcon as RefreshCwIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'pending';
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  testsCount: number;
  subscription?: {
    plan: string;
    status: string;
    expiryDate?: string;
  };
  profile?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    country?: string;
    city?: string;
  };
}

interface ComprehensiveUserManagementProps {
  lang: Language;
}

export function ComprehensiveUserManagement({ lang }: ComprehensiveUserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'user' as User['role'],
    status: 'active' as User['status'],
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '',
    city: '',
    password: '',
    sendWelcomeEmail: true
  });

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة المستخدمين الشاملة' : 'Comprehensive User Management',
    subtitle: isRTL ? 'إدارة شاملة لحسابات المستخدمين والصلاحيات' : 'Complete user accounts and permissions management',
    
    // Actions
    addUser: isRTL ? 'إضافة مستخدم' : 'Add User',
    editUser: isRTL ? 'تعديل المستخدم' : 'Edit User',
    viewUser: isRTL ? 'عرض المستخدم' : 'View User',
    deleteUser: isRTL ? 'حذف المستخدم' : 'Delete User',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    close: isRTL ? 'إغلاق' : 'Close',
    
    // Fields
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    displayName: isRTL ? 'الاسم المعروض' : 'Display Name',
    firstName: isRTL ? 'الاسم الأول' : 'First Name',
    lastName: isRTL ? 'الاسم الأخير' : 'Last Name',
    phoneNumber: isRTL ? 'رقم الهاتف' : 'Phone Number',
    country: isRTL ? 'البلد' : 'Country',
    city: isRTL ? 'المدينة' : 'City',
    password: isRTL ? 'كلمة المرور' : 'Password',
    role: isRTL ? 'الدور' : 'Role',
    status: isRTL ? 'الحالة' : 'Status',
    
    // Roles
    user: isRTL ? 'مستخدم' : 'User',
    admin: isRTL ? 'مدير' : 'Admin',
    superAdmin: isRTL ? 'مدير عام' : 'Super Admin',
    
    // Status
    active: isRTL ? 'نشط' : 'Active',
    inactive: isRTL ? 'غير نشط' : 'Inactive',
    pending: isRTL ? 'في الانتظار' : 'Pending',
    
    // Filters
    search: isRTL ? 'البحث...' : 'Search...',
    filterByRole: isRTL ? 'تصفية حسب الدور' : 'Filter by Role',
    filterByStatus: isRTL ? 'تصفية حسب الحالة' : 'Filter by Status',
    all: isRTL ? 'الكل' : 'All',
    
    // Stats
    totalUsers: isRTL ? 'إجمالي المستخدمين' : 'Total Users',
    activeUsers: isRTL ? 'المستخدمين النشطين' : 'Active Users',
    adminUsers: isRTL ? 'المديرين' : 'Admins',
    
    // Messages
    userAdded: isRTL ? 'تم إضافة المستخدم بنجاح' : 'User added successfully',
    userUpdated: isRTL ? 'تم تحديث المستخدم بنجاح' : 'User updated successfully',
    userDeleted: isRTL ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully',
    confirmDelete: isRTL ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?',
    
    // Form
    sendWelcomeEmail: isRTL ? 'إرسال بريد ترحيبي' : 'Send Welcome Email',
    emailVerified: isRTL ? 'البريد مؤكد' : 'Email Verified',
    lastLogin: isRTL ? 'آخر تسجيل دخول' : 'Last Login',
    testsCount: isRTL ? 'عدد الاختبارات' : 'Tests Count',
    subscription: isRTL ? 'الاشتراك' : 'Subscription',
    
    // Validation
    emailRequired: isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required',
    passwordRequired: isRTL ? 'كلمة المرور مطلوبة' : 'Password is required',
    displayNameRequired: isRTL ? 'الاسم المعروض مطلوب' : 'Display name is required',
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(usersQuery);
      
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastLoginAt: doc.data().lastLoginAt?.toDate?.()?.toISOString(),
      })) as User[];
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(isRTL ? 'خطأ في تحميل المستخدمين' : 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.password || !formData.displayName) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Send email verification if requested
      if (formData.sendWelcomeEmail) {
        await sendEmailVerification(user);
      }

      // Create user document in Firestore
      await addDoc(collection(db, 'users'), {
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
        status: formData.status,
        emailVerified: false,
        createdAt: serverTimestamp(),
        testsCount: 0,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          country: formData.country,
          city: formData.city,
        }
      });

      toast.success(texts.userAdded);
      setShowAddModal(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || (isRTL ? 'خطأ في إضافة المستخدم' : 'Error adding user'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        role: formData.role,
        status: formData.status,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          country: formData.country,
          city: formData.city,
        },
        updatedAt: serverTimestamp()
      });

      toast.success(texts.userUpdated);
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(isRTL ? 'خطأ في تحديث المستخدم' : 'Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(texts.confirmDelete)) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
      toast.success(texts.userDeleted);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(isRTL ? 'خطأ في حذف المستخدم' : 'Error deleting user');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      displayName: '',
      role: 'user',
      status: 'active',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      country: '',
      city: '',
      password: '',
      sendWelcomeEmail: true
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      displayName: user.displayName || '',
      role: user.role,
      status: user.status,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      phoneNumber: user.profile?.phoneNumber || '',
      country: user.profile?.country || '',
      city: user.profile?.city || '',
      password: '',
      sendWelcomeEmail: false
    });
    setShowEditModal(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length
  };

  const getRoleBadge = (role: User['role']) => {
    const config = {
      user: { variant: 'secondary' as const, icon: UserIcon, text: texts.user },
      admin: { variant: 'default' as const, icon: ShieldCheckIcon, text: texts.admin },
      super_admin: { variant: 'destructive' as const, icon: ShieldCheckIcon, text: texts.superAdmin }
    };

    // إضافة فحص للتأكد من وجود الدور في config
    const roleConfig = config[role] || config.user; // استخدام user كافتراضي
    const { variant, icon: Icon, text } = roleConfig;

    return (
      <Badge variant={variant} className="flex items-center space-x-1 rtl:space-x-reverse">
        <Icon className="h-3 w-3" />
        <span>{text}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: User['status']) => {
    const config = {
      active: { variant: 'default' as const, text: texts.active },
      inactive: { variant: 'secondary' as const, text: texts.inactive },
      pending: { variant: 'outline' as const, text: texts.pending }
    };
    
    const { variant, text } = config[status];
    
    return <Badge variant={variant}>{text}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {texts.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {texts.subtitle}
          </p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button onClick={loadUsers} variant="outline" disabled={loading}>
            <RefreshCwIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.refresh}
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.addUser}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {texts.totalUsers}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-600" />
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
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {texts.adminUsers}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.admins}
                </p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={texts.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder={texts.filterByRole} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{texts.all}</SelectItem>
                <SelectItem value="user">{texts.user}</SelectItem>
                <SelectItem value="admin">{texts.admin}</SelectItem>
                <SelectItem value="super_admin">{texts.superAdmin}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder={texts.filterByStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{texts.all}</SelectItem>
                <SelectItem value="active">{texts.active}</SelectItem>
                <SelectItem value="inactive">{texts.inactive}</SelectItem>
                <SelectItem value="pending">{texts.pending}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{texts.title}</span>
            <Badge variant="secondary">{filteredUsers.length} {isRTL ? 'مستخدم' : 'users'}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left rtl:text-right p-4 font-medium">
                    {isRTL ? 'المستخدم' : 'User'}
                  </th>
                  <th className="text-left rtl:text-right p-4 font-medium">
                    {texts.role}
                  </th>
                  <th className="text-left rtl:text-right p-4 font-medium">
                    {texts.status}
                  </th>
                  <th className="text-left rtl:text-right p-4 font-medium">
                    {texts.testsCount}
                  </th>
                  <th className="text-left rtl:text-right p-4 font-medium">
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {(user.displayName || user.email)?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.displayName || user.email?.split('@')[0]}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="p-4">
                      <span className="text-gray-900 dark:text-white">
                        {user.testsCount || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewModal(user)}
                          title={texts.viewUser}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          title={texts.editUser}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          title={texts.deleteUser}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {isRTL ? 'لا توجد مستخدمين' : 'No users found'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className={`max-w-2xl ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <PlusIcon className="h-5 w-5" />
              <span>{texts.addUser}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{texts.email} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{texts.password} *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">{texts.displayName} *</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder={isRTL ? 'أدخل الاسم المعروض' : 'Enter display name'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{texts.role}</Label>
                <Select value={formData.role} onValueChange={(value: User['role']) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">{texts.user}</SelectItem>
                    <SelectItem value="admin">{texts.admin}</SelectItem>
                    <SelectItem value="super_admin">{texts.superAdmin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">{texts.firstName}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder={isRTL ? 'أدخل الاسم الأول' : 'Enter first name'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{texts.lastName}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder={isRTL ? 'أدخل الاسم الأخير' : 'Enter last name'}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                checked={formData.sendWelcomeEmail}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendWelcomeEmail: checked }))}
              />
              <Label>{texts.sendWelcomeEmail}</Label>
            </div>

            <div className="flex justify-end space-x-2 rtl:space-x-reverse">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                {texts.cancel}
              </Button>
              <Button onClick={handleAddUser} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:ml-2 rtl:mr-0"></div>
                    {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {texts.save}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className={`max-w-2xl ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <PencilIcon className="h-5 w-5" />
              <span>{texts.editUser}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">{texts.email}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-displayName">{texts.displayName}</Label>
                <Input
                  id="edit-displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder={isRTL ? 'أدخل الاسم المعروض' : 'Enter display name'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">{texts.role}</Label>
                <Select value={formData.role} onValueChange={(value: User['role']) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">{texts.user}</SelectItem>
                    <SelectItem value="admin">{texts.admin}</SelectItem>
                    <SelectItem value="super_admin">{texts.superAdmin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">{texts.status}</Label>
                <Select value={formData.status} onValueChange={(value: User['status']) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{texts.active}</SelectItem>
                    <SelectItem value="inactive">{texts.inactive}</SelectItem>
                    <SelectItem value="pending">{texts.pending}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-firstName">{texts.firstName}</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder={isRTL ? 'أدخل الاسم الأول' : 'Enter first name'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-lastName">{texts.lastName}</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder={isRTL ? 'أدخل الاسم الأخير' : 'Enter last name'}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 rtl:space-x-reverse">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                {texts.cancel}
              </Button>
              <Button onClick={handleEditUser} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:ml-2 rtl:mr-0"></div>
                    {isRTL ? 'جاري التحديث...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {texts.save}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className={`max-w-2xl ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <EyeIcon className="h-5 w-5" />
              <span>{texts.viewUser}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">{texts.email}:</span>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{texts.displayName}:</span>
                      <p className="font-medium">{selectedUser.displayName || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{texts.role}:</span>
                      <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{texts.status}:</span>
                      <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    {isRTL ? 'الإحصائيات' : 'Statistics'}
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">{texts.testsCount}:</span>
                      <p className="font-medium">{selectedUser.testsCount || 0}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{texts.emailVerified}:</span>
                      <p className="font-medium">
                        {selectedUser.emailVerified ?
                          <Badge variant="default">{isRTL ? 'مؤكد' : 'Verified'}</Badge> :
                          <Badge variant="secondary">{isRTL ? 'غير مؤكد' : 'Not Verified'}</Badge>
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{isRTL ? 'تاريخ التسجيل' : 'Join Date'}:</span>
                      <p className="font-medium">
                        {new Date(selectedUser.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowViewModal(false)}>
                  {texts.close}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
