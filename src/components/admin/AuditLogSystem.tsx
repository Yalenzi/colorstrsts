'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  EyeIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ChartBarIcon,
  CalendarIcon,
  LockClosedIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'BACKUP' | 'RESTORE';
  resource: string;
  resourceId?: string;
  resourceName?: string;
  changes?: {
    before?: any;
    after?: any;
    fields?: string[];
  };
  metadata: {
    ipAddress: string;
    userAgent: string;
    location?: string;
    deviceType: string;
    sessionId: string;
    requestId: string;
  };
  result: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  errorMessage?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'AUTHENTICATION' | 'AUTHORIZATION' | 'DATA_ACCESS' | 'DATA_MODIFICATION' | 'SYSTEM' | 'SECURITY';
  tags: string[];
  riskScore: number;
}

interface AuditFilter {
  dateRange: {
    start: string;
    end: string;
  };
  userId?: string;
  action?: string;
  resource?: string;
  result?: string;
  severity?: string;
  category?: string;
  searchTerm?: string;
}

interface SecurityAlert {
  id: string;
  timestamp: string;
  type: 'SUSPICIOUS_LOGIN' | 'MULTIPLE_FAILURES' | 'UNUSUAL_ACTIVITY' | 'DATA_BREACH' | 'PRIVILEGE_ESCALATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  descriptionAr: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  relatedLogs: string[];
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  assignedTo?: string;
  notes?: string;
}

interface ComplianceReport {
  id: string;
  name: string;
  nameAr: string;
  type: 'GDPR' | 'SOX' | 'HIPAA' | 'PCI_DSS' | 'ISO27001' | 'CUSTOM';
  period: {
    start: string;
    end: string;
  };
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  findings: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  generatedAt?: string;
  generatedBy: string;
  downloadUrl?: string;
}

interface AuditLogSystemProps {
  lang: Language;
}

export function AuditLogSystem({ lang }: AuditLogSystemProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filter, setFilter] = useState<AuditFilter>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'نظام سجل المراجعة' : 'Audit Log System',
    subtitle: isRTL ? 'مراقبة شاملة لجميع العمليات والأنشطة الأمنية' : 'Comprehensive monitoring of all operations and security activities',
    
    // Tabs
    auditLogs: isRTL ? 'سجلات المراجعة' : 'Audit Logs',
    securityAlerts: isRTL ? 'التنبيهات الأمنية' : 'Security Alerts',
    compliance: isRTL ? 'التقارير التنظيمية' : 'Compliance Reports',
    analytics: isRTL ? 'التحليلات' : 'Analytics',
    
    // Actions
    create: isRTL ? 'إنشاء' : 'Create',
    read: isRTL ? 'قراءة' : 'Read',
    update: isRTL ? 'تحديث' : 'Update',
    delete: isRTL ? 'حذف' : 'Delete',
    login: isRTL ? 'تسجيل دخول' : 'Login',
    logout: isRTL ? 'تسجيل خروج' : 'Logout',
    export: isRTL ? 'تصدير' : 'Export',
    import: isRTL ? 'استيراد' : 'Import',
    backup: isRTL ? 'نسخ احتياطي' : 'Backup',
    restore: isRTL ? 'استعادة' : 'Restore',
    
    // Results
    success: isRTL ? 'نجح' : 'Success',
    failure: isRTL ? 'فشل' : 'Failure',
    partial: isRTL ? 'جزئي' : 'Partial',
    
    // Severity
    low: isRTL ? 'منخفض' : 'Low',
    medium: isRTL ? 'متوسط' : 'Medium',
    high: isRTL ? 'عالي' : 'High',
    critical: isRTL ? 'حرج' : 'Critical',
    
    // Categories
    authentication: isRTL ? 'المصادقة' : 'Authentication',
    authorization: isRTL ? 'التخويل' : 'Authorization',
    dataAccess: isRTL ? 'الوصول للبيانات' : 'Data Access',
    dataModification: isRTL ? 'تعديل البيانات' : 'Data Modification',
    system: isRTL ? 'النظام' : 'System',
    security: isRTL ? 'الأمان' : 'Security',
    
    // Log Details
    timestamp: isRTL ? 'الوقت' : 'Timestamp',
    user: isRTL ? 'المستخدم' : 'User',
    action: isRTL ? 'الإجراء' : 'Action',
    resource: isRTL ? 'المورد' : 'Resource',
    result: isRTL ? 'النتيجة' : 'Result',
    ipAddress: isRTL ? 'عنوان IP' : 'IP Address',
    userAgent: isRTL ? 'وكيل المستخدم' : 'User Agent',
    location: isRTL ? 'الموقع' : 'Location',
    deviceType: isRTL ? 'نوع الجهاز' : 'Device Type',
    sessionId: isRTL ? 'معرف الجلسة' : 'Session ID',
    requestId: isRTL ? 'معرف الطلب' : 'Request ID',
    changes: isRTL ? 'التغييرات' : 'Changes',
    before: isRTL ? 'قبل' : 'Before',
    after: isRTL ? 'بعد' : 'After',
    fields: isRTL ? 'الحقول' : 'Fields',
    errorMessage: isRTL ? 'رسالة الخطأ' : 'Error Message',
    severity: isRTL ? 'الخطورة' : 'Severity',
    category: isRTL ? 'الفئة' : 'Category',
    tags: isRTL ? 'العلامات' : 'Tags',
    riskScore: isRTL ? 'نقاط المخاطر' : 'Risk Score',
    
    // Security Alerts
    suspiciousLogin: isRTL ? 'تسجيل دخول مشبوه' : 'Suspicious Login',
    multipleFailures: isRTL ? 'فشل متعدد' : 'Multiple Failures',
    unusualActivity: isRTL ? 'نشاط غير عادي' : 'Unusual Activity',
    dataBreach: isRTL ? 'خرق البيانات' : 'Data Breach',
    privilegeEscalation: isRTL ? 'تصعيد الصلاحيات' : 'Privilege Escalation',
    
    // Alert Status
    open: isRTL ? 'مفتوح' : 'Open',
    investigating: isRTL ? 'قيد التحقيق' : 'Investigating',
    resolved: isRTL ? 'محلول' : 'Resolved',
    falsePositive: isRTL ? 'إيجابي خاطئ' : 'False Positive',
    
    // Compliance
    gdpr: 'GDPR',
    sox: 'SOX',
    hipaa: 'HIPAA',
    pciDss: 'PCI DSS',
    iso27001: 'ISO 27001',
    custom: isRTL ? 'مخصص' : 'Custom',
    
    // Report Status
    generating: isRTL ? 'جاري الإنشاء' : 'Generating',
    completed: isRTL ? 'مكتمل' : 'Completed',
    failed: isRTL ? 'فشل' : 'Failed',
    
    // Filters
    filters: isRTL ? 'المرشحات' : 'Filters',
    dateRange: isRTL ? 'نطاق التاريخ' : 'Date Range',
    startDate: isRTL ? 'تاريخ البداية' : 'Start Date',
    endDate: isRTL ? 'تاريخ النهاية' : 'End Date',
    searchTerm: isRTL ? 'مصطلح البحث' : 'Search Term',
    
    // Actions
    view: isRTL ? 'عرض' : 'View',
    filter: isRTL ? 'تصفية' : 'Filter',
    export: isRTL ? 'تصدير' : 'Export',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    clear: isRTL ? 'مسح' : 'Clear',
    apply: isRTL ? 'تطبيق' : 'Apply',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    download: isRTL ? 'تحميل' : 'Download',
    investigate: isRTL ? 'تحقيق' : 'Investigate',
    resolve: isRTL ? 'حل' : 'Resolve',
    
    // Messages
    loading: isRTL ? 'جاري التحميل...' : 'Loading...',
    noData: isRTL ? 'لا توجد بيانات' : 'No data available',
    exportSuccess: isRTL ? 'تم التصدير بنجاح' : 'Export completed successfully',
    error: isRTL ? 'حدث خطأ' : 'An error occurred',
    
    // Placeholders
    searchPlaceholder: isRTL ? 'البحث في السجلات...' : 'Search logs...',
    selectUser: isRTL ? 'اختر المستخدم' : 'Select user',
    selectAction: isRTL ? 'اختر الإجراء' : 'Select action',
    selectResource: isRTL ? 'اختر المورد' : 'Select resource',
    selectResult: isRTL ? 'اختر النتيجة' : 'Select result',
    selectSeverity: isRTL ? 'اختر الخطورة' : 'Select severity',
    selectCategory: isRTL ? 'اختر الفئة' : 'Select category',
    
    // Statistics
    totalLogs: isRTL ? 'إجمالي السجلات' : 'Total Logs',
    successfulOperations: isRTL ? 'العمليات الناجحة' : 'Successful Operations',
    failedOperations: isRTL ? 'العمليات الفاشلة' : 'Failed Operations',
    criticalEvents: isRTL ? 'الأحداث الحرجة' : 'Critical Events',
    uniqueUsers: isRTL ? 'المستخدمون الفريدون' : 'Unique Users',
    topActions: isRTL ? 'أهم الإجراءات' : 'Top Actions',
    riskDistribution: isRTL ? 'توزيع المخاطر' : 'Risk Distribution',
    
    // Time Periods
    last24Hours: isRTL ? 'آخر 24 ساعة' : 'Last 24 Hours',
    last7Days: isRTL ? 'آخر 7 أيام' : 'Last 7 Days',
    last30Days: isRTL ? 'آخر 30 يوم' : 'Last 30 Days',
    lastMonth: isRTL ? 'الشهر الماضي' : 'Last Month',
    custom: isRTL ? 'مخصص' : 'Custom',
  };

  useEffect(() => {
    loadAuditLogs();
    loadSecurityAlerts();
    loadComplianceReports();
  }, [filter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      console.log('🔄 بدء تحميل سجلات المراجعة...');
      
      // Mock data for demonstration
      const logs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-15T10:30:00Z',
          userId: 'admin123',
          userEmail: 'admin@colorstest.com',
          userName: 'Admin User',
          userRole: 'super_admin',
          action: 'CREATE',
          resource: 'tests',
          resourceId: 'test_001',
          resourceName: 'Chemical Test Alpha',
          changes: {
            after: { name: 'Chemical Test Alpha', category: 'forensics', isActive: true },
            fields: ['name', 'category', 'isActive']
          },
          metadata: {
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            location: 'Riyadh, Saudi Arabia',
            deviceType: 'Desktop',
            sessionId: 'sess_abc123',
            requestId: 'req_xyz789'
          },
          result: 'SUCCESS',
          severity: 'LOW',
          category: 'DATA_MODIFICATION',
          tags: ['test_creation', 'admin_action'],
          riskScore: 2
        },
        {
          id: '2',
          timestamp: '2024-01-15T10:25:00Z',
          userId: 'user456',
          userEmail: 'user@example.com',
          userName: 'Regular User',
          userRole: 'user',
          action: 'LOGIN',
          resource: 'authentication',
          metadata: {
            ipAddress: '203.0.113.45',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
            location: 'Jeddah, Saudi Arabia',
            deviceType: 'Mobile',
            sessionId: 'sess_def456',
            requestId: 'req_uvw012'
          },
          result: 'FAILURE',
          errorMessage: 'Invalid credentials',
          severity: 'MEDIUM',
          category: 'AUTHENTICATION',
          tags: ['login_failure', 'mobile_access'],
          riskScore: 5
        },
        {
          id: '3',
          timestamp: '2024-01-15T10:20:00Z',
          userId: 'admin123',
          userEmail: 'admin@colorstest.com',
          userName: 'Admin User',
          userRole: 'super_admin',
          action: 'DELETE',
          resource: 'users',
          resourceId: 'user_789',
          resourceName: 'test@example.com',
          changes: {
            before: { email: 'test@example.com', role: 'user', isActive: true },
            fields: ['email', 'role', 'isActive']
          },
          metadata: {
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            location: 'Riyadh, Saudi Arabia',
            deviceType: 'Desktop',
            sessionId: 'sess_abc123',
            requestId: 'req_ghi345'
          },
          result: 'SUCCESS',
          severity: 'HIGH',
          category: 'DATA_MODIFICATION',
          tags: ['user_deletion', 'admin_action', 'data_removal'],
          riskScore: 8
        }
      ];
      
      setAuditLogs(logs);
      console.log(`✅ تم تحميل ${logs.length} سجل مراجعة بنجاح`);
    } catch (error) {
      console.error('❌ خطأ في تحميل سجلات المراجعة:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityAlerts = async () => {
    try {
      console.log('🔄 بدء تحميل التنبيهات الأمنية...');
      
      const alerts: SecurityAlert[] = [
        {
          id: '1',
          timestamp: '2024-01-15T10:25:00Z',
          type: 'MULTIPLE_FAILURES',
          severity: 'HIGH',
          description: 'Multiple failed login attempts detected from IP 203.0.113.45',
          descriptionAr: 'تم اكتشاف محاولات تسجيل دخول فاشلة متعددة من IP 203.0.113.45',
          userId: 'user456',
          userEmail: 'user@example.com',
          ipAddress: '203.0.113.45',
          relatedLogs: ['2', '4', '5'],
          status: 'OPEN',
          assignedTo: 'security_team'
        },
        {
          id: '2',
          timestamp: '2024-01-15T09:15:00Z',
          type: 'UNUSUAL_ACTIVITY',
          severity: 'MEDIUM',
          description: 'User accessing system from unusual location',
          descriptionAr: 'مستخدم يصل للنظام من موقع غير عادي',
          userId: 'user789',
          userEmail: 'another@example.com',
          ipAddress: '198.51.100.25',
          relatedLogs: ['6'],
          status: 'INVESTIGATING',
          assignedTo: 'admin123',
          notes: 'User confirmed travel to new location'
        }
      ];
      
      setSecurityAlerts(alerts);
      console.log(`✅ تم تحميل ${alerts.length} تنبيه أمني بنجاح`);
    } catch (error) {
      console.error('❌ خطأ في تحميل التنبيهات الأمنية:', error);
    }
  };

  const loadComplianceReports = async () => {
    try {
      console.log('🔄 بدء تحميل التقارير التنظيمية...');
      
      const reports: ComplianceReport[] = [
        {
          id: '1',
          name: 'GDPR Compliance Report - January 2024',
          nameAr: 'تقرير امتثال GDPR - يناير 2024',
          type: 'GDPR',
          period: {
            start: '2024-01-01',
            end: '2024-01-31'
          },
          status: 'COMPLETED',
          findings: {
            total: 15,
            critical: 0,
            high: 2,
            medium: 8,
            low: 5
          },
          generatedAt: '2024-01-15T08:00:00Z',
          generatedBy: 'admin123',
          downloadUrl: '/reports/gdpr_jan_2024.pdf'
        },
        {
          id: '2',
          name: 'Security Audit Report - Q4 2023',
          nameAr: 'تقرير مراجعة الأمان - الربع الرابع 2023',
          type: 'ISO27001',
          period: {
            start: '2023-10-01',
            end: '2023-12-31'
          },
          status: 'GENERATING',
          findings: {
            total: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
          },
          generatedBy: 'admin123'
        }
      ];
      
      setComplianceReports(reports);
      console.log(`✅ تم تحميل ${reports.length} تقرير تنظيمي بنجاح`);
    } catch (error) {
      console.error('❌ خطأ في تحميل التقارير التنظيمية:', error);
    }
  };

  const getActionBadge = (action: AuditLogEntry['action']) => {
    const config = {
      CREATE: { color: 'bg-green-100 text-green-800', text: texts.create },
      READ: { color: 'bg-blue-100 text-blue-800', text: texts.read },
      UPDATE: { color: 'bg-yellow-100 text-yellow-800', text: texts.update },
      DELETE: { color: 'bg-red-100 text-red-800', text: texts.delete },
      LOGIN: { color: 'bg-purple-100 text-purple-800', text: texts.login },
      LOGOUT: { color: 'bg-gray-100 text-gray-800', text: texts.logout },
      EXPORT: { color: 'bg-orange-100 text-orange-800', text: texts.export },
      IMPORT: { color: 'bg-indigo-100 text-indigo-800', text: texts.import },
      BACKUP: { color: 'bg-teal-100 text-teal-800', text: texts.backup },
      RESTORE: { color: 'bg-pink-100 text-pink-800', text: texts.restore }
    };
    
    const actionConfig = config[action] || config.READ;
    return <Badge className={actionConfig.color}>{actionConfig.text}</Badge>;
  };

  const getResultBadge = (result: AuditLogEntry['result']) => {
    const config = {
      SUCCESS: { color: 'bg-green-100 text-green-800', text: texts.success, icon: CheckCircleIcon },
      FAILURE: { color: 'bg-red-100 text-red-800', text: texts.failure, icon: XCircleIcon },
      PARTIAL: { color: 'bg-yellow-100 text-yellow-800', text: texts.partial, icon: ExclamationTriangleIcon }
    };
    
    const resultConfig = config[result];
    const IconComponent = resultConfig.icon;
    
    return (
      <Badge className={resultConfig.color}>
        <IconComponent className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
        {resultConfig.text}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: AuditLogEntry['severity']) => {
    const config = {
      LOW: { color: 'bg-green-100 text-green-800', text: texts.low },
      MEDIUM: { color: 'bg-yellow-100 text-yellow-800', text: texts.medium },
      HIGH: { color: 'bg-orange-100 text-orange-800', text: texts.high },
      CRITICAL: { color: 'bg-red-100 text-red-800', text: texts.critical }
    };
    
    const severityConfig = config[severity];
    return <Badge className={severityConfig.color}>{severityConfig.text}</Badge>;
  };

  const getAlertTypeBadge = (type: SecurityAlert['type']) => {
    const config = {
      SUSPICIOUS_LOGIN: { color: 'bg-yellow-100 text-yellow-800', text: texts.suspiciousLogin },
      MULTIPLE_FAILURES: { color: 'bg-red-100 text-red-800', text: texts.multipleFailures },
      UNUSUAL_ACTIVITY: { color: 'bg-orange-100 text-orange-800', text: texts.unusualActivity },
      DATA_BREACH: { color: 'bg-red-100 text-red-800', text: texts.dataBreach },
      PRIVILEGE_ESCALATION: { color: 'bg-purple-100 text-purple-800', text: texts.privilegeEscalation }
    };
    
    const typeConfig = config[type];
    return <Badge className={typeConfig.color}>{typeConfig.text}</Badge>;
  };

  const getAlertStatusBadge = (status: SecurityAlert['status']) => {
    const config = {
      OPEN: { color: 'bg-red-100 text-red-800', text: texts.open },
      INVESTIGATING: { color: 'bg-yellow-100 text-yellow-800', text: texts.investigating },
      RESOLVED: { color: 'bg-green-100 text-green-800', text: texts.resolved },
      FALSE_POSITIVE: { color: 'bg-gray-100 text-gray-800', text: texts.falsePositive }
    };
    
    const statusConfig = config[status];
    return <Badge className={statusConfig.color}>{statusConfig.text}</Badge>;
  };

  const exportLogs = async () => {
    try {
      console.log('🔄 بدء تصدير سجلات المراجعة...');
      
      // Create CSV content
      const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Result', 'IP Address', 'Severity'];
      const csvContent = [
        headers.join(','),
        ...auditLogs.map(log => [
          log.timestamp,
          log.userEmail,
          log.action,
          log.resource,
          log.result,
          log.metadata.ipAddress,
          log.severity
        ].join(','))
      ].join('\n');

      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(texts.exportSuccess);
      console.log('✅ تم تصدير سجلات المراجعة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تصدير سجلات المراجعة:', error);
      toast.error(texts.error);
    }
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 rtl:space-x-reverse">
            <DocumentTextIcon className="h-6 w-6" />
            <span>{texts.title}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {texts.subtitle}
          </p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
            <FunnelIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.filter}
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.export}
          </Button>
          <Button onClick={loadAuditLogs}>
            <ArrowPathIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.refresh}
          </Button>
        </div>
      </div>

      {/* Audit System Tabs */}
      <Tabs defaultValue="auditLogs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auditLogs">{texts.auditLogs}</TabsTrigger>
          <TabsTrigger value="securityAlerts">{texts.securityAlerts}</TabsTrigger>
          <TabsTrigger value="compliance">{texts.compliance}</TabsTrigger>
          <TabsTrigger value="analytics">{texts.analytics}</TabsTrigger>
        </TabsList>

        {/* Audit Logs Tab */}
        <TabsContent value="auditLogs">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-2 rtl:space-x-reverse">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={texts.searchPlaceholder}
                  className="pl-10 rtl:pr-10 rtl:pl-3"
                  value={filter.searchTerm || ''}
                  onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
                />
              </div>
            </div>

            {/* Audit Logs List */}
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <Card key={log.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                          {getActionBadge(log.action)}
                          {getResultBadge(log.result)}
                          {getSeverityBadge(log.severity)}
                          <span className="text-sm text-gray-600">{log.resource}</span>
                          {log.resourceName && (
                            <span className="text-xs text-gray-500">({log.resourceName})</span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">{texts.user}</p>
                            <p className="font-medium">{log.userEmail}</p>
                            <p className="text-xs text-gray-500">{log.userRole}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">{texts.timestamp}</p>
                            <p className="font-medium">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">{texts.ipAddress}</p>
                            <p className="font-medium">{log.metadata.ipAddress}</p>
                            <p className="text-xs text-gray-500">{log.metadata.location}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">{texts.riskScore}</p>
                            <p className={`font-medium ${log.riskScore >= 7 ? 'text-red-600' : log.riskScore >= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {log.riskScore}/10
                            </p>
                          </div>
                        </div>

                        {log.errorMessage && (
                          <div className="mt-2">
                            <p className="text-sm text-red-600">{texts.errorMessage}: {log.errorMessage}</p>
                          </div>
                        )}

                        {log.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {log.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Download individual log as JSON
                            const logData = JSON.stringify(log, null, 2);
                            const blob = new Blob([logData], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `audit_log_${log.id}_${new Date(log.timestamp).toISOString().split('T')[0]}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            toast.success(texts.exportSuccess);
                          }}
                          title={texts.download}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setShowLogDetails(true);
                          }}
                          title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Security Alerts Tab */}
        <TabsContent value="securityAlerts">
          <div className="space-y-4">
            {securityAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                        {getAlertTypeBadge(alert.type)}
                        {getSeverityBadge(alert.severity)}
                        {getAlertStatusBadge(alert.status)}
                      </div>
                      
                      <p className="font-medium mb-2">
                        {isRTL ? alert.descriptionAr : alert.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">{texts.timestamp}</p>
                          <p className="font-medium">{new Date(alert.timestamp).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">{texts.ipAddress}</p>
                          <p className="font-medium">{alert.ipAddress}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">{isRTL ? 'المكلف' : 'Assigned To'}</p>
                          <p className="font-medium">{alert.assignedTo || '-'}</p>
                        </div>
                      </div>

                      {alert.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">{isRTL ? 'ملاحظات:' : 'Notes:'} {alert.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button variant="outline" size="sm">
                        {texts.investigate}
                      </Button>
                      <Button variant="outline" size="sm">
                        {texts.resolve}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Compliance Reports Tab */}
        <TabsContent value="compliance">
          <div className="space-y-4">
            {complianceReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                        <h4 className="font-medium">{isRTL ? report.nameAr : report.name}</h4>
                        <Badge>{report.type}</Badge>
                        <Badge variant={report.status === 'COMPLETED' ? 'default' : report.status === 'GENERATING' ? 'secondary' : 'destructive'}>
                          {texts[report.status.toLowerCase() as keyof typeof texts]}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">{texts.dateRange}</p>
                          <p className="font-medium">
                            {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">{isRTL ? 'إجمالي النتائج' : 'Total Findings'}</p>
                          <p className="font-medium">{report.findings.total}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">{isRTL ? 'النتائج الحرجة' : 'Critical Findings'}</p>
                          <p className="font-medium text-red-600">{report.findings.critical}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">{isRTL ? 'تاريخ الإنشاء' : 'Generated'}</p>
                          <p className="font-medium">
                            {report.generatedAt ? new Date(report.generatedAt).toLocaleDateString() : '-'}
                          </p>
                        </div>
                      </div>

                      {report.status === 'COMPLETED' && (
                        <div className="mt-3 flex space-x-4 rtl:space-x-reverse text-sm">
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>{texts.critical}: {report.findings.critical}</span>
                          </div>
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <div className="w-3 h-3 bg-orange-500 rounded"></div>
                            <span>{texts.high}: {report.findings.high}</span>
                          </div>
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span>{texts.medium}: {report.findings.medium}</span>
                          </div>
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>{texts.low}: {report.findings.low}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      {report.downloadUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Download report functionality
                            const link = document.createElement('a');
                            link.href = report.downloadUrl!;
                            link.download = `${report.title.replace(/\s+/g, '_')}_${report.id}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            toast.success(texts.exportSuccess);
                          }}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                          {texts.download}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Preview report functionality
                          if (report.downloadUrl) {
                            window.open(report.downloadUrl, '_blank');
                          } else {
                            toast.info(isRTL ? 'معاينة التقرير غير متاحة' : 'Report preview not available');
                          }
                        }}
                        title={isRTL ? 'معاينة التقرير' : 'Preview Report'}
                      >
                        <EyeIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {isRTL ? 'معاينة' : 'Preview'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.totalLogs}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {auditLogs.length.toLocaleString()}
                    </p>
                  </div>
                  <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.successfulOperations}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {auditLogs.filter(log => log.result === 'SUCCESS').length.toLocaleString()}
                    </p>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.failedOperations}</p>
                    <p className="text-2xl font-bold text-red-600">
                      {auditLogs.filter(log => log.result === 'FAILURE').length.toLocaleString()}
                    </p>
                  </div>
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.criticalEvents}</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {auditLogs.filter(log => log.severity === 'CRITICAL').length.toLocaleString()}
                    </p>
                  </div>
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Log Details Dialog */}
      <Dialog open={showLogDetails} onOpenChange={setShowLogDetails}>
        <DialogContent className={`max-w-4xl ${isRTL ? 'rtl' : 'ltr'}`}>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تفاصيل السجل' : 'Log Details'}</DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{texts.timestamp}</Label>
                  <p className="font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <Label>{texts.user}</Label>
                  <p className="font-medium">{selectedLog.userEmail} ({selectedLog.userRole})</p>
                </div>
                <div>
                  <Label>{texts.action}</Label>
                  <div>{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <Label>{texts.result}</Label>
                  <div>{getResultBadge(selectedLog.result)}</div>
                </div>
                <div>
                  <Label>{texts.resource}</Label>
                  <p className="font-medium">{selectedLog.resource}</p>
                  {selectedLog.resourceName && (
                    <p className="text-sm text-gray-600">{selectedLog.resourceName}</p>
                  )}
                </div>
                <div>
                  <Label>{texts.severity}</Label>
                  <div>{getSeverityBadge(selectedLog.severity)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{texts.ipAddress}</Label>
                  <p className="font-medium">{selectedLog.metadata.ipAddress}</p>
                </div>
                <div>
                  <Label>{texts.location}</Label>
                  <p className="font-medium">{selectedLog.metadata.location || '-'}</p>
                </div>
                <div>
                  <Label>{texts.deviceType}</Label>
                  <p className="font-medium">{selectedLog.metadata.deviceType}</p>
                </div>
                <div>
                  <Label>{texts.sessionId}</Label>
                  <p className="font-medium font-mono text-sm">{selectedLog.metadata.sessionId}</p>
                </div>
              </div>

              {selectedLog.changes && (
                <div>
                  <Label>{texts.changes}</Label>
                  <div className="mt-2 space-y-2">
                    {selectedLog.changes.before && (
                      <div>
                        <p className="text-sm font-medium text-red-600">{texts.before}:</p>
                        <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-x-auto">
                          {JSON.stringify(selectedLog.changes.before, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.changes.after && (
                      <div>
                        <p className="text-sm font-medium text-green-600">{texts.after}:</p>
                        <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded overflow-x-auto">
                          {JSON.stringify(selectedLog.changes.after, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedLog.errorMessage && (
                <div>
                  <Label className="text-red-600">{texts.errorMessage}</Label>
                  <p className="text-red-600 font-medium">{selectedLog.errorMessage}</p>
                </div>
              )}

              {selectedLog.tags.length > 0 && (
                <div>
                  <Label>{texts.tags}</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedLog.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>{texts.userAgent}</Label>
                <p className="text-sm text-gray-600 break-all">{selectedLog.metadata.userAgent}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogDetails(false)}>
              {texts.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className={`max-w-2xl ${isRTL ? 'rtl' : 'ltr'}`}>
          <DialogHeader>
            <DialogTitle>{texts.filters}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{texts.startDate}</Label>
                <Input
                  type="date"
                  value={filter.dateRange.start}
                  onChange={(e) => setFilter(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>{texts.endDate}</Label>
                <Input
                  type="date"
                  value={filter.dateRange.end}
                  onChange={(e) => setFilter(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{texts.action}</Label>
                <Select value={filter.action || ''} onValueChange={(value) => setFilter(prev => ({ ...prev, action: value || undefined }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={texts.selectAction} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{texts.all || 'All'}</SelectItem>
                    <SelectItem value="CREATE">{texts.create}</SelectItem>
                    <SelectItem value="READ">{texts.read}</SelectItem>
                    <SelectItem value="UPDATE">{texts.update}</SelectItem>
                    <SelectItem value="DELETE">{texts.delete}</SelectItem>
                    <SelectItem value="LOGIN">{texts.login}</SelectItem>
                    <SelectItem value="LOGOUT">{texts.logout}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{texts.result}</Label>
                <Select value={filter.result || ''} onValueChange={(value) => setFilter(prev => ({ ...prev, result: value || undefined }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={texts.selectResult} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{texts.all || 'All'}</SelectItem>
                    <SelectItem value="SUCCESS">{texts.success}</SelectItem>
                    <SelectItem value="FAILURE">{texts.failure}</SelectItem>
                    <SelectItem value="PARTIAL">{texts.partial}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{texts.severity}</Label>
                <Select value={filter.severity || ''} onValueChange={(value) => setFilter(prev => ({ ...prev, severity: value || undefined }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={texts.selectSeverity} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{texts.all || 'All'}</SelectItem>
                    <SelectItem value="LOW">{texts.low}</SelectItem>
                    <SelectItem value="MEDIUM">{texts.medium}</SelectItem>
                    <SelectItem value="HIGH">{texts.high}</SelectItem>
                    <SelectItem value="CRITICAL">{texts.critical}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{texts.resource}</Label>
                <Select value={filter.resource || ''} onValueChange={(value) => setFilter(prev => ({ ...prev, resource: value || undefined }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={texts.selectResource} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{texts.all || 'All'}</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="tests">Tests</SelectItem>
                    <SelectItem value="subscriptions">Subscriptions</SelectItem>
                    <SelectItem value="transactions">Transactions</SelectItem>
                    <SelectItem value="authentication">Authentication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFilter({
              dateRange: {
                start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              }
            })}>
              {texts.clear}
            </Button>
            <Button onClick={() => {
              setShowFilterDialog(false);
              loadAuditLogs();
            }}>
              {texts.apply}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
