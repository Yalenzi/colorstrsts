'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  UserIcon,
  ArrowPathIcon as RefreshCwIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface AdminUser {
  email: string;
  role: 'admin' | 'super_admin';
  status: 'active' | 'inactive';
  displayName?: string;
  createdAt?: string;
  lastLogin?: string;
  isActive: boolean;
}

interface EnhancedAdminRoleFixerProps {
  lang: Language;
}

export function EnhancedAdminRoleFixer({ lang }: EnhancedAdminRoleFixerProps) {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'admin' as 'admin' | 'super_admin',
    displayName: '',
    password: ''
  });

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة أدوار المديرين المتقدمة' : 'Enhanced Admin Role Management',
    subtitle: isRTL ? 'إدارة شاملة لحسابات المديرين والأدوار' : 'Comprehensive management of admin accounts and roles',
    checkRoles: isRTL ? 'فحص الأدوار' : 'Check Roles',
    fixRoles: isRTL ? 'إصلاح الأدوار' : 'Fix Roles',
    addAdmin: isRTL ? 'إضافة مدير' : 'Add Admin',
    editAdmin: isRTL ? 'تعديل المدير' : 'Edit Admin',
    deleteAdmin: isRTL ? 'حذف المدير' : 'Delete Admin',
    viewDetails: isRTL ? 'عرض التفاصيل' : 'View Details',
    
    // Status
    active: isRTL ? 'نشط' : 'Active',
    inactive: isRTL ? 'غير نشط' : 'Inactive',
    admin: isRTL ? 'مدير' : 'Admin',
    superAdmin: isRTL ? 'مدير عام' : 'Super Admin',
    
    // Form fields
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    displayName: isRTL ? 'الاسم المعروض' : 'Display Name',
    role: isRTL ? 'الدور' : 'Role',
    password: isRTL ? 'كلمة المرور' : 'Password',
    status: isRTL ? 'الحالة' : 'Status',
    
    // Actions
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    delete: isRTL ? 'حذف' : 'Delete',
    confirm: isRTL ? 'تأكيد' : 'Confirm',
    
    // Messages
    checking: isRTL ? 'جاري الفحص...' : 'Checking...',
    fixing: isRTL ? 'جاري الإصلاح...' : 'Fixing...',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    success: isRTL ? 'تم بنجاح' : 'Success',
    error: isRTL ? 'حدث خطأ' : 'Error occurred',
    
    // Descriptions
    addDescription: isRTL ? 'إضافة حساب مدير جديد للنظام' : 'Add a new admin account to the system',
    editDescription: isRTL ? 'تعديل معلومات وصلاحيات المدير' : 'Edit admin information and permissions',
    deleteConfirm: isRTL ? 'هل أنت متأكد من حذف هذا المدير؟' : 'Are you sure you want to delete this admin?',
    
    // Validation
    emailRequired: isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required',
    passwordRequired: isRTL ? 'كلمة المرور مطلوبة' : 'Password is required',
    invalidEmail: isRTL ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format',
  };

  // Default admin emails
  const defaultAdminEmails = [
    'aburakan4551@gmail.com',
    'admin@colorstest.com'
  ];

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const admins: AdminUser[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.role === 'admin' || userData.role === 'super_admin') {
          admins.push({
            email: userData.email || doc.id,
            role: userData.role,
            status: userData.isActive ? 'active' : 'inactive',
            displayName: userData.displayName,
            createdAt: userData.createdAt,
            lastLogin: userData.lastLogin,
            isActive: userData.isActive || false
          });
        }
      });

      // Add default admins if not found
      for (const email of defaultAdminEmails) {
        if (!admins.find(admin => admin.email === email)) {
          admins.push({
            email,
            role: 'super_admin',
            status: 'inactive',
            isActive: false
          });
        }
      }

      setAdminUsers(admins);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndFixRoles = async () => {
    try {
      setChecking(true);
      let fixedCount = 0;

      for (const adminUser of adminUsers) {
        const userDocId = adminUser.email.replace('@', '_').replace(/\./g, '_');
        const userRef = doc(db, 'users', userDocId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // Create missing admin user
          await setDoc(userRef, {
            email: adminUser.email,
            role: adminUser.role,
            isActive: true,
            displayName: adminUser.displayName || adminUser.email.split('@')[0],
            createdAt: new Date().toISOString(),
            emailVerified: true,
            profile: {
              firstName: 'Admin',
              lastName: 'User'
            }
          });
          fixedCount++;
        } else {
          // Update existing user if needed
          const userData = userDoc.data();
          if (userData.role !== adminUser.role || !userData.isActive) {
            await updateDoc(userRef, {
              role: adminUser.role,
              isActive: true,
              updatedAt: new Date().toISOString()
            });
            fixedCount++;
          }
        }
      }

      toast.success(`${texts.success}: ${fixedCount} ${isRTL ? 'مدير تم إصلاحه' : 'admins fixed'}`);
      await loadAdminUsers();
    } catch (error) {
      console.error('Error fixing roles:', error);
      toast.error(texts.error);
    } finally {
      setChecking(false);
    }
  };

  const handleAddAdmin = async () => {
    try {
      if (!newUser.email || !newUser.password) {
        toast.error(isRTL ? 'جميع الحقول مطلوبة' : 'All fields are required');
        return;
      }

      setLoading(true);

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      await sendEmailVerification(userCredential.user);

      // Create user document in Firestore
      const userDocId = newUser.email.replace('@', '_').replace(/\./g, '_');
      const userRef = doc(db, 'users', userDocId);
      
      await setDoc(userRef, {
        email: newUser.email,
        role: newUser.role,
        isActive: true,
        displayName: newUser.displayName || newUser.email.split('@')[0],
        createdAt: new Date().toISOString(),
        emailVerified: false,
        profile: {
          firstName: newUser.displayName?.split(' ')[0] || 'Admin',
          lastName: newUser.displayName?.split(' ')[1] || 'User'
        }
      });

      toast.success(texts.success);
      setShowAddDialog(false);
      setNewUser({ email: '', role: 'admin', displayName: '', password: '' });
      await loadAdminUsers();
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast.error(error.message || texts.error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAdmin = async () => {
    try {
      if (!editingUser) return;

      setLoading(true);
      const userDocId = editingUser.email.replace('@', '_').replace(/\./g, '_');
      const userRef = doc(db, 'users', userDocId);

      await updateDoc(userRef, {
        role: editingUser.role,
        isActive: editingUser.status === 'active',
        displayName: editingUser.displayName,
        updatedAt: new Date().toISOString()
      });

      toast.success(texts.success);
      setShowEditDialog(false);
      setEditingUser(null);
      await loadAdminUsers();
    } catch (error) {
      console.error('Error editing admin:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (email: string) => {
    try {
      if (!confirm(texts.deleteConfirm)) return;

      setLoading(true);
      const userDocId = email.replace('@', '_').replace(/\./g, '_');
      const userRef = doc(db, 'users', userDocId);

      await deleteDoc(userRef);
      toast.success(texts.success);
      await loadAdminUsers();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <ShieldCheckIcon className="h-4 w-4 text-red-600" />;
      case 'admin':
        return <ShieldCheckIcon className="h-4 w-4 text-orange-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        {texts.active}
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        {texts.inactive}
      </Badge>
    );
  };

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
          <Button
            onClick={checkAndFixRoles}
            disabled={checking}
            variant="outline"
          >
            {checking ? (
              <RefreshCwIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
            ) : (
              <CogIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            )}
            {checking ? texts.checking : texts.fixRoles}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.addAdmin}
          </Button>
        </div>
      </div>

      {/* Admin Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <UserPlusIcon className="h-5 w-5" />
            <span>{isRTL ? 'قائمة المديرين' : 'Admin Users List'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminUsers.map((admin, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    {getRoleIcon(admin.role)}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {admin.displayName || admin.email}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {admin.email}
                      </div>
                    </div>
                    <Badge variant={admin.role === 'super_admin' ? 'destructive' : 'default'}>
                      {admin.role === 'super_admin' ? texts.superAdmin : texts.admin}
                    </Badge>
                    {getStatusBadge(admin.status)}
                  </div>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingUser(admin);
                        setShowEditDialog(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAdmin(admin.email)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texts.addAdmin}</DialogTitle>
            <DialogDescription>{texts.addDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{texts.email}</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
              />
            </div>
            <div>
              <Label htmlFor="displayName">{texts.displayName}</Label>
              <Input
                id="displayName"
                value={newUser.displayName}
                onChange={(e) => setNewUser(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder={isRTL ? 'أدخل الاسم المعروض' : 'Enter display name'}
              />
            </div>
            <div>
              <Label htmlFor="password">{texts.password}</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
              />
            </div>
            <div>
              <Label htmlFor="role">{texts.role}</Label>
              <Select value={newUser.role} onValueChange={(value: 'admin' | 'super_admin') => setNewUser(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{texts.admin}</SelectItem>
                  <SelectItem value="super_admin">{texts.superAdmin}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {texts.cancel}
            </Button>
            <Button onClick={handleAddAdmin} disabled={loading}>
              {loading ? texts.saving : texts.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texts.editAdmin}</DialogTitle>
            <DialogDescription>{texts.editDescription}</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label>{texts.email}</Label>
                <Input value={editingUser.email} disabled />
              </div>
              <div>
                <Label htmlFor="editDisplayName">{texts.displayName}</Label>
                <Input
                  id="editDisplayName"
                  value={editingUser.displayName || ''}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, displayName: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="editRole">{texts.role}</Label>
                <Select value={editingUser.role} onValueChange={(value: 'admin' | 'super_admin') => setEditingUser(prev => prev ? ({ ...prev, role: value }) : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{texts.admin}</SelectItem>
                    <SelectItem value="super_admin">{texts.superAdmin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">{texts.status}</Label>
                <Select value={editingUser.status} onValueChange={(value: 'active' | 'inactive') => setEditingUser(prev => prev ? ({ ...prev, status: value }) : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{texts.active}</SelectItem>
                    <SelectItem value="inactive">{texts.inactive}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {texts.cancel}
            </Button>
            <Button onClick={handleEditAdmin} disabled={loading}>
              {loading ? texts.saving : texts.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
