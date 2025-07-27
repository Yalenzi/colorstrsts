'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { auth, db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc,
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  UserIcon,
  ArrowPathIcon as RefreshCwIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AdminRoleFixerProps {
  lang: Language;
}

export function AdminRoleFixer({ lang }: AdminRoleFixerProps) {
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [adminEmails] = useState([
    'aburakan4551@gmail.com',
    'admin@colorstest.com'
  ]);
  
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إصلاح أدوار المديرين' : 'Fix Admin Roles',
    subtitle: isRTL ? 'تحديث أدوار المديرين في قاعدة البيانات' : 'Update admin roles in database',
    adminEmails: isRTL ? 'بريد المديرين' : 'Admin Emails',
    currentRole: isRTL ? 'الدور الحالي' : 'Current Role',
    newRole: isRTL ? 'الدور الجديد' : 'New Role',
    fixRoles: isRTL ? 'إصلاح الأدوار' : 'Fix Roles',
    fixing: isRTL ? 'جاري الإصلاح...' : 'Fixing...',
    checkStatus: isRTL ? 'فحص الحالة' : 'Check Status',
    checking: isRTL ? 'جاري الفحص...' : 'Checking...',
    rolesFixed: isRTL ? 'تم إصلاح الأدوار بنجاح' : 'Roles fixed successfully',
    noIssuesFound: isRTL ? 'لا توجد مشاكل في الأدوار' : 'No role issues found',
    error: isRTL ? 'خطأ في العملية' : 'Operation error',
    
    // Roles
    user: isRTL ? 'مستخدم' : 'User',
    admin: isRTL ? 'مدير' : 'Admin',
    superAdmin: isRTL ? 'مدير عام' : 'Super Admin',
    
    // Status
    needsFix: isRTL ? 'يحتاج إصلاح' : 'Needs Fix',
    correct: isRTL ? 'صحيح' : 'Correct',
    notFound: isRTL ? 'غير موجود' : 'Not Found',
  };

  const [adminStatus, setAdminStatus] = useState<{
    email: string;
    currentRole: string | null;
    needsFix: boolean;
    exists: boolean;
  }[]>([]);

  const checkAdminRoles = async () => {
    setLoading(true);
    try {
      const statusList = [];
      
      for (const email of adminEmails) {
        // Check if user exists in Firestore
        const usersQuery = query(collection(db, 'users'), where('email', '==', email));
        const snapshot = await getDocs(usersQuery);
        
        if (snapshot.empty) {
          statusList.push({
            email,
            currentRole: null,
            needsFix: true,
            exists: false
          });
        } else {
          const userDoc = snapshot.docs[0];
          const userData = userDoc.data();
          const currentRole = userData.role || 'user';
          
          statusList.push({
            email,
            currentRole,
            needsFix: currentRole !== 'super_admin',
            exists: true
          });
        }
      }
      
      setAdminStatus(statusList);
      
      const issuesCount = statusList.filter(s => s.needsFix).length;
      if (issuesCount === 0) {
        toast.success(texts.noIssuesFound);
      } else {
        toast.info(`${issuesCount} ${isRTL ? 'مشكلة وجدت' : 'issues found'}`);
      }
    } catch (error) {
      console.error('Error checking admin roles:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const fixAdminRoles = async () => {
    setFixing(true);
    try {
      let fixedCount = 0;
      
      for (const admin of adminStatus) {
        if (!admin.needsFix) continue;
        
        if (!admin.exists) {
          // Create admin user document
          const usersQuery = query(collection(db, 'users'), where('email', '==', admin.email));
          const snapshot = await getDocs(usersQuery);
          
          if (snapshot.empty) {
            // Create new user document
            await setDoc(doc(collection(db, 'users')), {
              email: admin.email,
              displayName: admin.email.split('@')[0],
              role: 'super_admin',
              status: 'active',
              emailVerified: true,
              isActive: true,
              createdAt: serverTimestamp(),
              testsCount: 0,
              profile: {
                firstName: 'Admin',
                lastName: 'User',
              }
            });
            fixedCount++;
          }
        } else {
          // Update existing user role
          const usersQuery = query(collection(db, 'users'), where('email', '==', admin.email));
          const snapshot = await getDocs(usersQuery);
          
          if (!snapshot.empty) {
            const userDoc = snapshot.docs[0];
            await updateDoc(userDoc.ref, {
              role: 'super_admin',
              status: 'active',
              isActive: true,
              updatedAt: serverTimestamp()
            });
            fixedCount++;
          }
        }
      }
      
      if (fixedCount > 0) {
        toast.success(`${texts.rolesFixed} (${fixedCount})`);
        // Refresh status
        await checkAdminRoles();
      } else {
        toast.info(texts.noIssuesFound);
      }
    } catch (error) {
      console.error('Error fixing admin roles:', error);
      toast.error(texts.error);
    } finally {
      setFixing(false);
    }
  };

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case 'super_admin':
        return <ShieldCheckIcon className="h-4 w-4 text-red-600" />;
      case 'admin':
        return <ShieldCheckIcon className="h-4 w-4 text-orange-600" />;
      case 'user':
        return <UserIcon className="h-4 w-4 text-blue-600" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleBadge = (role: string | null, needsFix: boolean) => {
    if (!role) {
      return <Badge variant="destructive">{texts.notFound}</Badge>;
    }
    
    const roleText = role === 'super_admin' ? texts.superAdmin : 
                    role === 'admin' ? texts.admin : texts.user;
    
    return (
      <Badge variant={needsFix ? "destructive" : "default"} className="flex items-center space-x-1 rtl:space-x-reverse">
        {getRoleIcon(role)}
        <span>{roleText}</span>
      </Badge>
    );
  };

  const getStatusBadge = (needsFix: boolean, exists: boolean) => {
    if (!exists) {
      return <Badge variant="destructive">{texts.notFound}</Badge>;
    }
    
    return (
      <Badge variant={needsFix ? "destructive" : "default"}>
        {needsFix ? texts.needsFix : texts.correct}
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
          <Button onClick={checkAdminRoles} variant="outline" disabled={loading}>
            <RefreshCwIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {loading ? texts.checking : texts.checkStatus}
          </Button>
          <Button 
            onClick={fixAdminRoles} 
            disabled={fixing || adminStatus.length === 0 || !adminStatus.some(s => s.needsFix)}
            className="bg-red-600 hover:bg-red-700"
          >
            <CheckCircleIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {fixing ? texts.fixing : texts.fixRoles}
          </Button>
        </div>
      </div>

      {/* Admin Emails List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <ShieldCheckIcon className="h-5 w-5" />
            <span>{texts.adminEmails}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminEmails.map((email) => (
              <div key={email} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {isRTL ? 'مدير النظام' : 'System Administrator'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <ShieldCheckIcon className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium">{texts.superAdmin}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Results */}
      {adminStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'نتائج الفحص' : 'Check Results'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left rtl:text-right p-4 font-medium">
                      {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </th>
                    <th className="text-left rtl:text-right p-4 font-medium">
                      {texts.currentRole}
                    </th>
                    <th className="text-left rtl:text-right p-4 font-medium">
                      {isRTL ? 'الحالة' : 'Status'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {adminStatus.map((admin) => (
                    <tr key={admin.email} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {admin.email}
                        </div>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(admin.currentRole, admin.needsFix)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(admin.needsFix, admin.exists)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
