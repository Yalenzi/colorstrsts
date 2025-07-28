'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Users, Search, Mail, Calendar, TestTube, Crown } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
  joinDate: string;
  lastActive: string;
  testsCount: number;
  subscriptionStatus: 'free' | 'premium' | 'expired';
  subscriptionExpiry?: string;
}

export function UserManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
          subscriptionExpiry: '2024-02-15'
        },
        {
          id: '2',
          email: 'sara@example.com',
          name: 'سارة أحمد',
          joinDate: '2024-01-10',
          lastActive: '2024-01-19',
          testsCount: 12,
          subscriptionStatus: 'free'
        },
        {
          id: '3',
          email: 'omar@example.com',
          name: 'عمر خالد',
          joinDate: '2024-01-05',
          lastActive: '2024-01-18',
          testsCount: 8,
          subscriptionStatus: 'expired',
          subscriptionExpiry: '2024-01-10'
        }
      ];

      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(isRTL ? 'خطأ في تحميل المستخدمين' : 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: User['subscriptionStatus']) => {
    const variants = {
      free: { color: 'bg-gray-500', text: isRTL ? 'مجاني' : 'Free' },
      premium: { color: 'bg-green-500', text: isRTL ? 'مميز' : 'Premium' },
      expired: { color: 'bg-red-500', text: isRTL ? 'منتهي' : 'Expired' }
    };

    // إضافة حماية من undefined مع قيمة افتراضية
    const variant = variants[status] || variants.free;
    return (
      <Badge className={`${variant.color} text-white`}>
        {variant.text}
      </Badge>
    );
  };

  const updateUserSubscription = async (userId: string, newStatus: User['subscriptionStatus']) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              subscriptionStatus: newStatus,
              subscriptionExpiry: newStatus === 'premium' 
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                : undefined
            }
          : user
      ));
      
      toast.success(isRTL ? 'تم تحديث الاشتراك بنجاح' : 'Subscription updated successfully');
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error(isRTL ? 'خطأ في تحديث الاشتراك' : 'Error updating subscription');
    }
  };

  const exportUserData = () => {
    try {
      const csvData = [
        ['Email', 'Name', 'Join Date', 'Last Active', 'Tests Count', 'Subscription Status', 'Subscription Expiry'],
        ...filteredUsers.map(user => [
          user.email,
          user.name || '',
          user.joinDate,
          user.lastActive,
          user.testsCount.toString(),
          user.subscriptionStatus,
          user.subscriptionExpiry || ''
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(isRTL ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(isRTL ? 'خطأ في التصدير' : 'Export error');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {isRTL ? 'إدارة المستخدمين' : 'User Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={isRTL ? 'البحث بالإيميل أو الاسم...' : 'Search by email or name...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportUserData} variant="outline">
              {isRTL ? 'تصدير البيانات' : 'Export Data'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-sm text-gray-600">{isRTL ? 'إجمالي المستخدمين' : 'Total Users'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.subscriptionStatus === 'premium').length}
                    </p>
                    <p className="text-sm text-gray-600">{isRTL ? 'مشتركين مميزين' : 'Premium Users'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TestTube className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {users.reduce((sum, user) => sum + user.testsCount, 0)}
                    </p>
                    <p className="text-sm text-gray-600">{isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name || user.email}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {isRTL ? 'انضم في' : 'Joined'}: {user.joinDate}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <TestTube className="w-3 h-3" />
                            {user.testsCount} {isRTL ? 'اختبار' : 'tests'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusBadge(user.subscriptionStatus)}
                      
                      <div className="flex gap-2">
                        {user.subscriptionStatus !== 'premium' && (
                          <Button
                            size="sm"
                            onClick={() => updateUserSubscription(user.id, 'premium')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isRTL ? 'ترقية' : 'Upgrade'}
                          </Button>
                        )}
                        
                        {user.subscriptionStatus === 'premium' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserSubscription(user.id, 'free')}
                          >
                            {isRTL ? 'إلغاء' : 'Downgrade'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {user.subscriptionExpiry && (
                    <div className="mt-2 text-xs text-gray-500">
                      {isRTL ? 'ينتهي في' : 'Expires on'}: {user.subscriptionExpiry}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {isRTL ? 'لا توجد نتائج للبحث' : 'No users found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}