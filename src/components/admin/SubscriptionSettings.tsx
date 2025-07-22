import React, { useState, useEffect } from 'react';
import { useSubscriptionSettings } from '@/hooks/useSubscriptionSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Unlock,
  CheckCircle,
  Info,
  Crown,
  Star,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Language {
  code: string;
  name: string;
}

interface SubscriptionSettingsProps {
  lang: Language;
}

interface TestAccessSettings {
  freeTestsEnabled: boolean;
  freeTestsCount: number;
  premiumRequired: boolean;
  globalFreeAccess: boolean;
  specificPremiumTests: number[];
}

export default function SubscriptionSettings({ lang }: SubscriptionSettingsProps) {
  const isRTL = lang.code === 'ar';
  
  const {
    settings,
    loading,
    updateSettings,
    loadSettings
  } = useSubscriptionSettings();

  const [localSettings, setLocalSettings] = useState<TestAccessSettings>({
    freeTestsEnabled: settings?.freeTestsEnabled ?? true,
    freeTestsCount: settings?.freeTestsCount ?? 5,
    premiumRequired: settings?.premiumRequired ?? false,
    globalFreeAccess: settings?.globalFreeAccess ?? false,
    specificPremiumTests: settings?.specificPremiumTests ?? []
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // تحديث الإعدادات المحلية عند تغيير الإعدادات الأساسية
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        freeTestsEnabled: settings.freeTestsEnabled ?? true,
        freeTestsCount: settings.freeTestsCount ?? 5,
        premiumRequired: settings.premiumRequired ?? false,
        globalFreeAccess: settings.globalFreeAccess ?? false,
        specificPremiumTests: settings.specificPremiumTests ?? []
      });
    }
  }, [settings]);

  // تحديث الإعدادات المحلية عند تغيير الإعدادات الأساسية
  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  // تتبع التغييرات
  useEffect(() => {
    const hasChanged = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(hasChanged);
  }, [localSettings, settings]);

  // حفظ الإعدادات
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving subscription settings:', localSettings);
      
      const success = await updateSettings(localSettings);
      
      if (success) {
        toast.success(
          isRTL ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!'
        );
        setHasChanges(false);
        
        // إرسال تحديث فوري لجميع المكونات
        window.dispatchEvent(new CustomEvent('subscriptionSettingsUpdated', {
          detail: localSettings
        }));
        
        console.log('✅ Settings saved and broadcasted');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      toast.error(
        isRTL ? 'فشل في حفظ الإعدادات' : 'Failed to save settings'
      );
    } finally {
      setSaving(false);
    }
  };

  // إعادة تحميل الإعدادات
  const handleRefreshSettings = async () => {
    try {
      console.log('🔄 Refreshing settings...');
      await loadSettings();
      toast.success(
        isRTL ? 'تم تحديث الإعدادات' : 'Settings refreshed'
      );
    } catch (error) {
      console.error('❌ Error refreshing settings:', error);
      toast.error(
        isRTL ? 'فشل في تحديث الإعدادات' : 'Failed to refresh settings'
      );
    }
  };

  // تفعيل الوصول المجاني العام
  const handleGlobalFreeAccess = async (enabled: boolean) => {
    const newSettings = { ...localSettings, globalFreeAccess: enabled };
    setLocalSettings(newSettings);
    
    // حفظ فوري للوصول المجاني العام
    try {
      setSaving(true);
      const success = await updateSettings(newSettings);
      
      if (success) {
        toast.success(
          enabled 
            ? (isRTL ? 'تم تفعيل الوصول المجاني لجميع الاختبارات!' : 'All tests are now free!')
            : (isRTL ? 'تم إلغاء الوصول المجاني العام' : 'Global free access disabled')
        );
        
        // إرسال تحديث فوري
        window.dispatchEvent(new CustomEvent('subscriptionSettingsUpdated', {
          detail: newSettings
        }));
        
        console.log(`✅ Global free access ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('❌ Error updating global free access:', error);
      toast.error(
        isRTL ? 'فشل في تحديث الإعدادات' : 'Failed to update settings'
      );
      // إعادة الإعدادات للحالة السابقة
      setLocalSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  // إضافة/إزالة اختبار من القائمة المميزة
  const togglePremiumTest = (testNumber: number) => {
    const currentTests = localSettings.specificPremiumTests || [];
    const newPremiumTests = currentTests.includes(testNumber)
      ? currentTests.filter(t => t !== testNumber)
      : [...currentTests, testNumber];

    setLocalSettings(prev => ({
      ...prev,
      specificPremiumTests: newPremiumTests.sort((a, b) => a - b)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-2 text-gray-600">
          {isRTL ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isRTL ? 'إعدادات الاشتراكات' : 'Subscription Settings'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isRTL ? 'إدارة الوصول للاختبارات والاشتراكات' : 'Manage test access and subscriptions'}
          </p>
        </div>
        <Button
          onClick={handleRefreshSettings}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Global Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5 text-green-600" />
            {isRTL ? 'التحكم العام في الوصول' : 'Global Access Control'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'إعدادات عامة للتحكم في وصول جميع المستخدمين' : 'General settings for controlling all user access'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Free Access */}
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200">
            <div className="flex-1">
              <Label className="text-base font-medium text-green-800 dark:text-green-200">
                {isRTL ? 'فتح جميع الاختبارات مجانٍ' : 'Make All Tests Free'}
              </Label>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                {isRTL ? 'تمكين الوصول المجاني لجميع الاختبارات لكل المستخدمين' : 'Enable free access to all tests for everyone'}
              </p>
              {localSettings.globalFreeAccess && (
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                  {isRTL ? 'مفعل - جميع الاختبارات مجانية' : 'Active - All tests are free'}
                </Badge>
              )}
            </div>
            <Switch
              checked={localSettings.globalFreeAccess}
              onCheckedChange={handleGlobalFreeAccess}
              disabled={saving}
            />
          </div>

          {/* Free Tests Settings - مخفي عند تفعيل الوصول العام */}
          {!localSettings.globalFreeAccess && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    {isRTL ? 'تفعيل الاختبارات المجانية' : 'Enable Free Tests'}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {isRTL ? 'السماح بعدد محدود من الاختبارات المجانية' : 'Allow limited number of free tests'}
                  </p>
                </div>
                <Switch
                  checked={localSettings.freeTestsEnabled}
                  onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, freeTestsEnabled: checked }))}
                />
              </div>

              {localSettings.freeTestsEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="freeTestsCount">
                    {isRTL ? 'عدد الاختبارات المجانية' : 'Number of Free Tests'}
                  </Label>
                  <Input
                    id="freeTestsCount"
                    type="number"
                    min="0"
                    max="20"
                    value={localSettings.freeTestsCount}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      freeTestsCount: parseInt(e.target.value) || 0 
                    }))}
                    className="w-32"
                  />
                  <p className="text-sm text-gray-600">
                    {isRTL ? 'عدد الاختبارات المجانية المتاحة لكل مستخدم' : 'Number of free tests available per user'}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    {isRTL ? 'الاختبارات المتقدمة تتطلب اشتراك' : 'Advanced Tests Require Subscription'}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {isRTL ? 'الاختبارات بعد الحد المجاني تتطلب اشتراك مميز' : 'Tests beyond free limit require premium subscription'}
                  </p>
                </div>
                <Switch
                  checked={localSettings.premiumRequired}
                  onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, premiumRequired: checked }))}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Specific Premium Tests - مخفي عند تفعيل الوصول العام */}
      {!localSettings.globalFreeAccess && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              {isRTL ? 'اختبارات مميزة محددة' : 'Specific Premium Tests'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'تحديد اختبارات معينة تتطلب اشتراك مميز' : 'Specify individual tests that require premium subscription'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 20 }, (_, i) => i + 1).map(testNumber => (
                <div
                  key={testNumber}
                  className={`
                    p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${(localSettings.specificPremiumTests || []).includes(testNumber)
                      ? 'border-yellow-300 bg-yellow-50 text-yellow-800'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }
                  `}
                  onClick={() => togglePremiumTest(testNumber)}
                >
                  <div className="text-center">
                    <div className="font-semibold">
                      {isRTL ? `اختبار ${testNumber}` : `Test ${testNumber}`}
                    </div>
                    {(localSettings.specificPremiumTests || []).includes(testNumber) && (
                      <Crown className="h-4 w-4 mx-auto mt-1 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {isRTL ? 'اضغط على الاختبارات لتحديدها كمميزة' : 'Click on tests to mark them as premium'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Status */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">
              {isRTL ? 'الحالة الحالية:' : 'Current Status:'}
            </p>
            <ul className="text-sm space-y-1">
              {localSettings.globalFreeAccess ? (
                <li className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {isRTL ? 'جميع الاختبارات مجانية للجميع' : 'All tests are free for everyone'}
                </li>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {isRTL
                      ? `${localSettings.freeTestsCount} اختبارات مجانية متاحة`
                      : `${localSettings.freeTestsCount} free tests available`
                    }
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    {isRTL
                      ? `${(localSettings.specificPremiumTests || []).length} اختبارات تتطلب اشتراك مميز`
                      : `${(localSettings.specificPremiumTests || []).length} tests require premium subscription`
                    }
                  </li>
                </>
              )}
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Save Button */}
      {hasChanges && !localSettings.globalFreeAccess && (
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isRTL ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              isRTL ? 'حفظ الإعدادات' : 'Save Settings'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

