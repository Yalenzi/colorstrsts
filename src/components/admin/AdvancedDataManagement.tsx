'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  CircleStackIcon as DatabaseIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  FolderIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ChartBarIcon,
  CogIcon,
  KeyIcon,
  LockClosedIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface ImportPreview {
  fileName: string;
  fileSize: number;
  recordCount: number;
  columns: string[];
  sampleData: any[];
  duplicates: number;
  errors: string[];
  targetCollection: string;
}

interface ExportOptions {
  collection: string;
  format: 'json' | 'csv' | 'excel';
  includeMetadata: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: {
    field: string;
    operator: string;
    value: any;
  }[];
  encryption: boolean;
  password?: string;
}

interface BackupJob {
  id: string;
  name: string;
  nameAr: string;
  collections: string[];
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  size?: number;
  duration?: number;
  encryption: boolean;
  retention: number; // days
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  collection: string;
  documentId?: string;
  changes?: any;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

interface DataCleanupRule {
  id: string;
  name: string;
  nameAr: string;
  collection: string;
  condition: {
    field: string;
    operator: string;
    value: any;
  };
  action: 'delete' | 'archive' | 'update';
  enabled: boolean;
  lastRun?: string;
  affectedCount?: number;
  dryRun: boolean;
}

interface AdvancedDataManagementProps {
  lang: Language;
}

export function AdvancedDataManagement({ lang }: AdvancedDataManagementProps) {
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    collection: 'users',
    format: 'json',
    includeMetadata: true,
    encryption: false
  });
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [cleanupRules, setCleanupRules] = useState<DataCleanupRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [progress, setProgress] = useState(0);

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة البيانات المتقدمة' : 'Advanced Data Management',
    subtitle: isRTL ? 'استيراد وتصدير ونسخ احتياطي وإدارة شاملة للبيانات' : 'Import, export, backup and comprehensive data management',
    
    // Tabs
    importExport: isRTL ? 'استيراد/تصدير' : 'Import/Export',
    backup: isRTL ? 'النسخ الاحتياطي' : 'Backup',
    auditLog: isRTL ? 'سجل المراجعة' : 'Audit Log',
    cleanup: isRTL ? 'تنظيف البيانات' : 'Data Cleanup',
    
    // Import/Export
    importData: isRTL ? 'استيراد البيانات' : 'Import Data',
    exportData: isRTL ? 'تصدير البيانات' : 'Export Data',
    selectFile: isRTL ? 'اختر ملف' : 'Select File',
    previewData: isRTL ? 'معاينة البيانات' : 'Preview Data',
    importOptions: isRTL ? 'خيارات الاستيراد' : 'Import Options',
    exportOptions: isRTL ? 'خيارات التصدير' : 'Export Options',
    targetCollection: isRTL ? 'المجموعة المستهدفة' : 'Target Collection',
    fileFormat: isRTL ? 'تنسيق الملف' : 'File Format',
    includeMetadata: isRTL ? 'تضمين البيانات الوصفية' : 'Include Metadata',
    preventDuplicates: isRTL ? 'منع التكرار' : 'Prevent Duplicates',
    encryption: isRTL ? 'التشفير' : 'Encryption',
    password: isRTL ? 'كلمة المرور' : 'Password',
    
    // File Info
    fileName: isRTL ? 'اسم الملف' : 'File Name',
    fileSize: isRTL ? 'حجم الملف' : 'File Size',
    recordCount: isRTL ? 'عدد السجلات' : 'Record Count',
    columns: isRTL ? 'الأعمدة' : 'Columns',
    duplicates: isRTL ? 'التكرارات' : 'Duplicates',
    errors: isRTL ? 'الأخطاء' : 'Errors',
    
    // Backup
    backupJobs: isRTL ? 'مهام النسخ الاحتياطي' : 'Backup Jobs',
    createBackup: isRTL ? 'إنشاء نسخة احتياطية' : 'Create Backup',
    scheduleBackup: isRTL ? 'جدولة النسخ الاحتياطي' : 'Schedule Backup',
    backupName: isRTL ? 'اسم النسخة الاحتياطية' : 'Backup Name',
    backupNameAr: isRTL ? 'اسم النسخة الاحتياطية بالعربية' : 'Backup Name (Arabic)',
    collections: isRTL ? 'المجموعات' : 'Collections',
    schedule: isRTL ? 'الجدولة' : 'Schedule',
    retention: isRTL ? 'فترة الاحتفاظ (أيام)' : 'Retention (days)',
    lastRun: isRTL ? 'آخر تشغيل' : 'Last Run',
    nextRun: isRTL ? 'التشغيل التالي' : 'Next Run',
    status: isRTL ? 'الحالة' : 'Status',
    size: isRTL ? 'الحجم' : 'Size',
    duration: isRTL ? 'المدة' : 'Duration',
    
    // Schedule Options
    manual: isRTL ? 'يدوي' : 'Manual',
    daily: isRTL ? 'يومي' : 'Daily',
    weekly: isRTL ? 'أسبوعي' : 'Weekly',
    monthly: isRTL ? 'شهري' : 'Monthly',
    
    // Status
    pending: isRTL ? 'في الانتظار' : 'Pending',
    running: isRTL ? 'قيد التشغيل' : 'Running',
    completed: isRTL ? 'مكتمل' : 'Completed',
    failed: isRTL ? 'فشل' : 'Failed',
    enabled: isRTL ? 'مفعل' : 'Enabled',
    disabled: isRTL ? 'معطل' : 'Disabled',
    
    // Audit Log
    timestamp: isRTL ? 'الوقت' : 'Timestamp',
    user: isRTL ? 'المستخدم' : 'User',
    action: isRTL ? 'الإجراء' : 'Action',
    collection: isRTL ? 'المجموعة' : 'Collection',
    document: isRTL ? 'المستند' : 'Document',
    changes: isRTL ? 'التغييرات' : 'Changes',
    ipAddress: isRTL ? 'عنوان IP' : 'IP Address',
    userAgent: isRTL ? 'وكيل المستخدم' : 'User Agent',
    success: isRTL ? 'نجح' : 'Success',
    errorMessage: isRTL ? 'رسالة الخطأ' : 'Error Message',
    
    // Data Cleanup
    cleanupRules: isRTL ? 'قواعد التنظيف' : 'Cleanup Rules',
    createRule: isRTL ? 'إنشاء قاعدة' : 'Create Rule',
    ruleName: isRTL ? 'اسم القاعدة' : 'Rule Name',
    ruleNameAr: isRTL ? 'اسم القاعدة بالعربية' : 'Rule Name (Arabic)',
    condition: isRTL ? 'الشرط' : 'Condition',
    field: isRTL ? 'الحقل' : 'Field',
    operator: isRTL ? 'المشغل' : 'Operator',
    value: isRTL ? 'القيمة' : 'Value',
    actionType: isRTL ? 'نوع الإجراء' : 'Action Type',
    dryRun: isRTL ? 'تشغيل تجريبي' : 'Dry Run',
    affectedCount: isRTL ? 'عدد المتأثرين' : 'Affected Count',
    
    // Actions
    delete: isRTL ? 'حذف' : 'Delete',
    archive: isRTL ? 'أرشفة' : 'Archive',
    update: isRTL ? 'تحديث' : 'Update',
    
    // Operators
    equals: isRTL ? 'يساوي' : 'Equals',
    notEquals: isRTL ? 'لا يساوي' : 'Not Equals',
    greaterThan: isRTL ? 'أكبر من' : 'Greater Than',
    lessThan: isRTL ? 'أصغر من' : 'Less Than',
    contains: isRTL ? 'يحتوي على' : 'Contains',
    startsWith: isRTL ? 'يبدأ بـ' : 'Starts With',
    endsWith: isRTL ? 'ينتهي بـ' : 'Ends With',
    
    // Collections
    users: isRTL ? 'المستخدمون' : 'Users',
    tests: isRTL ? 'الاختبارات' : 'Tests',
    subscriptions: isRTL ? 'الاشتراكات' : 'Subscriptions',
    transactions: isRTL ? 'المعاملات' : 'Transactions',
    settings: isRTL ? 'الإعدادات' : 'Settings',
    logs: isRTL ? 'السجلات' : 'Logs',
    
    // Actions
    import: isRTL ? 'استيراد' : 'Import',
    export: isRTL ? 'تصدير' : 'Export',
    backup: isRTL ? 'نسخ احتياطي' : 'Backup',
    restore: isRTL ? 'استعادة' : 'Restore',
    run: isRTL ? 'تشغيل' : 'Run',
    stop: isRTL ? 'إيقاف' : 'Stop',
    edit: isRTL ? 'تعديل' : 'Edit',
    view: isRTL ? 'عرض' : 'View',
    download: isRTL ? 'تحميل' : 'Download',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    save: isRTL ? 'حفظ' : 'Save',
    
    // Messages
    importing: isRTL ? 'جاري الاستيراد...' : 'Importing...',
    exporting: isRTL ? 'جاري التصدير...' : 'Exporting...',
    backing: isRTL ? 'جاري إنشاء النسخة الاحتياطية...' : 'Creating backup...',
    importSuccess: isRTL ? 'تم الاستيراد بنجاح' : 'Import completed successfully',
    exportSuccess: isRTL ? 'تم التصدير بنجاح' : 'Export completed successfully',
    backupSuccess: isRTL ? 'تم إنشاء النسخة الاحتياطية بنجاح' : 'Backup created successfully',
    error: isRTL ? 'حدث خطأ' : 'An error occurred',
    confirmDelete: isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?',
    
    // Validation
    required: isRTL ? 'هذا الحقل مطلوب' : 'This field is required',
    invalidFile: isRTL ? 'ملف غير صحيح' : 'Invalid file',
    fileTooLarge: isRTL ? 'الملف كبير جداً' : 'File too large',
    
    // File Formats
    json: 'JSON',
    csv: 'CSV',
    excel: 'Excel',
    
    // Date Range
    dateRange: isRTL ? 'نطاق التاريخ' : 'Date Range',
    startDate: isRTL ? 'تاريخ البداية' : 'Start Date',
    endDate: isRTL ? 'تاريخ النهاية' : 'End Date',
    
    // Security
    securityWarning: isRTL ? 'تحذير أمني' : 'Security Warning',
    sensitiveData: isRTL ? 'هذه العملية تتضمن بيانات حساسة' : 'This operation involves sensitive data',
    confirmPassword: isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password',
    
    // Progress
    progress: isRTL ? 'التقدم' : 'Progress',
    processing: isRTL ? 'جاري المعالجة...' : 'Processing...',
    completed: isRTL ? 'مكتمل' : 'Completed',
    
    // Statistics
    totalRecords: isRTL ? 'إجمالي السجلات' : 'Total Records',
    processedRecords: isRTL ? 'السجلات المعالجة' : 'Processed Records',
    skippedRecords: isRTL ? 'السجلات المتجاهلة' : 'Skipped Records',
    errorRecords: isRTL ? 'سجلات الأخطاء' : 'Error Records',
  };

  useEffect(() => {
    loadBackupJobs();
    loadAuditLogs();
    loadCleanupRules();
  }, []);

  const loadBackupJobs = async () => {
    try {
      console.log('🔄 بدء تحميل مهام النسخ الاحتياطي...');
      
      // Mock data for now
      const jobs: BackupJob[] = [
        {
          id: '1',
          name: 'Daily Users Backup',
          nameAr: 'نسخة احتياطية يومية للمستخدمين',
          collections: ['users'],
          schedule: 'daily',
          enabled: true,
          lastRun: '2024-01-15T02:00:00Z',
          nextRun: '2024-01-16T02:00:00Z',
          status: 'completed',
          size: 125 * 1024 * 1024, // 125 MB
          duration: 45000, // 45 seconds
          encryption: true,
          retention: 30
        },
        {
          id: '2',
          name: 'Weekly Full Backup',
          nameAr: 'نسخة احتياطية أسبوعية كاملة',
          collections: ['users', 'tests', 'subscriptions', 'transactions'],
          schedule: 'weekly',
          enabled: true,
          lastRun: '2024-01-14T01:00:00Z',
          nextRun: '2024-01-21T01:00:00Z',
          status: 'completed',
          size: 850 * 1024 * 1024, // 850 MB
          duration: 180000, // 3 minutes
          encryption: true,
          retention: 90
        }
      ];
      
      setBackupJobs(jobs);
      console.log(`✅ تم تحميل ${jobs.length} مهمة نسخ احتياطي بنجاح`);
    } catch (error) {
      console.error('❌ خطأ في تحميل مهام النسخ الاحتياطي:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      console.log('🔄 بدء تحميل سجل المراجعة...');
      
      // Mock data for now
      const logs: AuditLog[] = [
        {
          id: '1',
          timestamp: '2024-01-15T10:30:00Z',
          userId: 'admin123',
          userEmail: 'admin@colorstest.com',
          action: 'CREATE',
          collection: 'tests',
          documentId: 'test_001',
          changes: { name: 'New Chemical Test', category: 'forensics' },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          success: true
        },
        {
          id: '2',
          timestamp: '2024-01-15T10:25:00Z',
          userId: 'admin123',
          userEmail: 'admin@colorstest.com',
          action: 'UPDATE',
          collection: 'users',
          documentId: 'user_456',
          changes: { role: 'premium' },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          success: true
        },
        {
          id: '3',
          timestamp: '2024-01-15T10:20:00Z',
          userId: 'admin123',
          userEmail: 'admin@colorstest.com',
          action: 'DELETE',
          collection: 'tests',
          documentId: 'test_old',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          success: false,
          errorMessage: 'Permission denied'
        }
      ];
      
      setAuditLogs(logs);
      console.log(`✅ تم تحميل ${logs.length} سجل مراجعة بنجاح`);
    } catch (error) {
      console.error('❌ خطأ في تحميل سجل المراجعة:', error);
    }
  };

  const loadCleanupRules = async () => {
    try {
      console.log('🔄 بدء تحميل قواعد التنظيف...');
      
      // Mock data for now
      const rules: DataCleanupRule[] = [
        {
          id: '1',
          name: 'Delete Old Logs',
          nameAr: 'حذف السجلات القديمة',
          collection: 'logs',
          condition: {
            field: 'createdAt',
            operator: 'lessThan',
            value: '30 days ago'
          },
          action: 'delete',
          enabled: true,
          lastRun: '2024-01-15T01:00:00Z',
          affectedCount: 1250,
          dryRun: false
        },
        {
          id: '2',
          name: 'Archive Inactive Users',
          nameAr: 'أرشفة المستخدمين غير النشطين',
          collection: 'users',
          condition: {
            field: 'lastLogin',
            operator: 'lessThan',
            value: '90 days ago'
          },
          action: 'archive',
          enabled: false,
          dryRun: true
        }
      ];
      
      setCleanupRules(rules);
      console.log(`✅ تم تحميل ${rules.length} قاعدة تنظيف بنجاح`);
    } catch (error) {
      console.error('❌ خطأ في تحميل قواعد التنظيف:', error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      console.log('🔄 بدء معاينة الملف...');

      // Validate file
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error(texts.fileTooLarge);
        return;
      }

      const allowedTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(texts.invalidFile);
        return;
      }

      // Read file content
      const content = await file.text();
      let data: any[] = [];
      let columns: string[] = [];

      if (file.type === 'application/json') {
        data = JSON.parse(content);
        if (data.length > 0) {
          columns = Object.keys(data[0]);
        }
      } else if (file.type === 'text/csv') {
        const lines = content.split('\n');
        columns = lines[0].split(',').map(col => col.trim());
        data = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj: any = {};
          columns.forEach((col, index) => {
            obj[col] = values[index]?.trim();
          });
          return obj;
        }).filter(obj => Object.values(obj).some(val => val)); // Remove empty rows
      }

      // Check for duplicates (simplified)
      const emails = data.map(item => item.email).filter(Boolean);
      const duplicates = emails.length - new Set(emails).size;

      // Sample data (first 5 records)
      const sampleData = data.slice(0, 5);

      const preview: ImportPreview = {
        fileName: file.name,
        fileSize: file.size,
        recordCount: data.length,
        columns,
        sampleData,
        duplicates,
        errors: [],
        targetCollection: 'users'
      };

      setImportPreview(preview);
      setShowImportDialog(true);
      console.log('✅ تم إنشاء معاينة الملف بنجاح');
    } catch (error) {
      console.error('❌ خطأ في معاينة الملف:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importPreview) return;

    try {
      setImporting(true);
      setProgress(0);
      console.log('🔄 بدء استيراد البيانات...');

      // Simulate import progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      toast.success(texts.importSuccess);
      setShowImportDialog(false);
      setImportPreview(null);
      console.log('✅ تم استيراد البيانات بنجاح');
    } catch (error) {
      console.error('❌ خطأ في استيراد البيانات:', error);
      toast.error(texts.error);
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setProgress(0);
      console.log('🔄 بدء تصدير البيانات...');

      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      // Create download link (mock)
      const blob = new Blob(['{"exported": "data"}'], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportOptions.collection}_export.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(texts.exportSuccess);
      setShowExportDialog(false);
      console.log('✅ تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تصدير البيانات:', error);
      toast.error(texts.error);
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  const runBackupJob = async (jobId: string) => {
    try {
      console.log(`🔄 بدء تشغيل مهمة النسخ الاحتياطي: ${jobId}`);
      
      // Update job status
      setBackupJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: 'running' } : job
      ));

      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update job status to completed
      setBackupJobs(prev => prev.map(job => 
        job.id === jobId ? { 
          ...job, 
          status: 'completed',
          lastRun: new Date().toISOString(),
          duration: 3000
        } : job
      ));

      toast.success(texts.backupSuccess);
      console.log('✅ تم إنشاء النسخة الاحتياطية بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء النسخة الاحتياطية:', error);
      setBackupJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: 'failed' } : job
      ));
      toast.error(texts.error);
    }
  };

  const getStatusBadge = (status: BackupJob['status']) => {
    const config = {
      pending: { color: 'bg-gray-100 text-gray-800', text: texts.pending, icon: ClockIcon },
      running: { color: 'bg-blue-100 text-blue-800', text: texts.running, icon: ArrowPathIcon },
      completed: { color: 'bg-green-100 text-green-800', text: texts.completed, icon: CheckCircleIcon },
      failed: { color: 'bg-red-100 text-red-800', text: texts.failed, icon: ExclamationTriangleIcon }
    };
    
    const statusConfig = config[status];
    const IconComponent = statusConfig.icon;
    
    return (
      <Badge className={statusConfig.color}>
        <IconComponent className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
        {statusConfig.text}
      </Badge>
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 rtl:space-x-reverse">
            <DatabaseIcon className="h-6 w-6" />
            <span>{texts.title}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {texts.subtitle}
          </p>
        </div>
      </div>

      {/* Data Management Tabs */}
      <Tabs defaultValue="importExport" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="importExport">{texts.importExport}</TabsTrigger>
          <TabsTrigger value="backup">{texts.backup}</TabsTrigger>
          <TabsTrigger value="auditLog">{texts.auditLog}</TabsTrigger>
          <TabsTrigger value="cleanup">{texts.cleanup}</TabsTrigger>
        </TabsList>

        {/* Import/Export Tab */}
        <TabsContent value="importExport">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Import Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <ArrowUpTrayIcon className="h-5 w-5" />
                  <span>{texts.importData}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{texts.selectFile}</Label>
                  <Input
                    type="file"
                    accept=".json,.csv,.xlsx"
                    onChange={handleFileSelect}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-600">
                    {isRTL ? 'الصيغ المدعومة: JSON, CSV, Excel' : 'Supported formats: JSON, CSV, Excel'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{texts.targetCollection}</Label>
                  <Select defaultValue="users">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="users">{texts.users}</SelectItem>
                      <SelectItem value="tests">{texts.tests}</SelectItem>
                      <SelectItem value="subscriptions">{texts.subscriptions}</SelectItem>
                      <SelectItem value="transactions">{texts.transactions}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch defaultChecked />
                  <Label>{texts.preventDuplicates}</Label>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch />
                  <Label>{texts.encryption}</Label>
                </div>
              </CardContent>
            </Card>

            {/* Export Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>{texts.exportData}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{texts.collection}</Label>
                  <Select 
                    value={exportOptions.collection} 
                    onValueChange={(value) => setExportOptions(prev => ({ ...prev, collection: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="users">{texts.users}</SelectItem>
                      <SelectItem value="tests">{texts.tests}</SelectItem>
                      <SelectItem value="subscriptions">{texts.subscriptions}</SelectItem>
                      <SelectItem value="transactions">{texts.transactions}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{texts.fileFormat}</Label>
                  <Select 
                    value={exportOptions.format} 
                    onValueChange={(value: 'json' | 'csv' | 'excel') => setExportOptions(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">{texts.json}</SelectItem>
                      <SelectItem value="csv">{texts.csv}</SelectItem>
                      <SelectItem value="excel">{texts.excel}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch 
                    checked={exportOptions.includeMetadata}
                    onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeMetadata: checked }))}
                  />
                  <Label>{texts.includeMetadata}</Label>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch 
                    checked={exportOptions.encryption}
                    onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, encryption: checked }))}
                  />
                  <Label>{texts.encryption}</Label>
                </div>

                <Button onClick={() => setShowExportDialog(true)} className="w-full">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {texts.export}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{texts.backupJobs}</h3>
              <Button onClick={() => setShowBackupDialog(true)}>
                <DocumentArrowUpIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {texts.createBackup}
              </Button>
            </div>

            <div className="space-y-4">
              {backupJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                          <h4 className="font-medium">{isRTL ? job.nameAr : job.name}</h4>
                          {getStatusBadge(job.status)}
                          <Badge variant={job.enabled ? 'default' : 'secondary'}>
                            {job.enabled ? texts.enabled : texts.disabled}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">{texts.collections}</p>
                            <p className="font-medium">{job.collections.join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">{texts.schedule}</p>
                            <p className="font-medium">{texts[job.schedule]}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">{texts.lastRun}</p>
                            <p className="font-medium">
                              {job.lastRun ? new Date(job.lastRun).toLocaleDateString() : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">{texts.size}</p>
                            <p className="font-medium">
                              {job.size ? formatBytes(job.size) : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runBackupJob(job.id)}
                          disabled={job.status === 'running'}
                        >
                          {job.status === 'running' ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          ) : (
                            <ArrowPathIcon className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
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

        {/* Audit Log Tab */}
        <TabsContent value="auditLog">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <DocumentTextIcon className="h-5 w-5" />
                <span>{texts.auditLog}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Badge variant={log.success ? 'default' : 'destructive'}>
                          {log.action}
                        </Badge>
                        <span className="text-sm text-gray-600">{log.collection}</span>
                        {log.documentId && (
                          <span className="text-xs text-gray-500">#{log.documentId}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">{texts.user}</p>
                        <p className="font-medium">{log.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{texts.ipAddress}</p>
                        <p className="font-medium">{log.ipAddress}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{texts.success}</p>
                        <p className={`font-medium ${log.success ? 'text-green-600' : 'text-red-600'}`}>
                          {log.success ? '✓' : '✗'}
                        </p>
                      </div>
                    </div>
                    
                    {log.changes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-1">{texts.changes}:</p>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {log.errorMessage && (
                      <div className="mt-3">
                        <p className="text-sm text-red-600">{texts.errorMessage}: {log.errorMessage}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Cleanup Tab */}
        <TabsContent value="cleanup">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{texts.cleanupRules}</h3>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {texts.createRule}
              </Button>
            </div>

            <div className="space-y-4">
              {cleanupRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                          <h4 className="font-medium">{isRTL ? rule.nameAr : rule.name}</h4>
                          <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                            {rule.enabled ? texts.enabled : texts.disabled}
                          </Badge>
                          {rule.dryRun && (
                            <Badge variant="outline">{texts.dryRun}</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">{texts.collection}</p>
                            <p className="font-medium">{rule.collection}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">{texts.condition}</p>
                            <p className="font-medium">
                              {rule.condition.field} {rule.condition.operator} {rule.condition.value}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">{texts.actionType}</p>
                            <p className="font-medium">{texts[rule.action]}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">{texts.affectedCount}</p>
                            <p className="font-medium">
                              {rule.affectedCount ? rule.affectedCount.toLocaleString() : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button variant="outline" size="sm">
                          <ArrowPathIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className={`max-w-4xl ${isRTL ? 'rtl' : 'ltr'}`}>
          <DialogHeader>
            <DialogTitle>{texts.previewData}</DialogTitle>
            <DialogDescription>
              {isRTL ? 'راجع البيانات قبل الاستيراد' : 'Review data before importing'}
            </DialogDescription>
          </DialogHeader>
          
          {importPreview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{texts.fileName}</p>
                  <p className="font-medium">{importPreview.fileName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{texts.fileSize}</p>
                  <p className="font-medium">{formatBytes(importPreview.fileSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{texts.recordCount}</p>
                  <p className="font-medium">{importPreview.recordCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{texts.duplicates}</p>
                  <p className="font-medium text-yellow-600">{importPreview.duplicates}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">{texts.columns}:</p>
                <div className="flex flex-wrap gap-1">
                  {importPreview.columns.map((column) => (
                    <Badge key={column} variant="outline">{column}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">{isRTL ? 'عينة من البيانات:' : 'Sample Data:'}:</p>
                <div className="border rounded overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {importPreview.columns.map((column) => (
                          <th key={column} className="px-3 py-2 text-left">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.sampleData.map((row, index) => (
                        <tr key={index} className="border-t">
                          {importPreview.columns.map((column) => (
                            <td key={column} className="px-3 py-2">{row[column]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {importing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{texts.progress}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)} disabled={importing}>
              {texts.cancel}
            </Button>
            <Button onClick={handleImport} disabled={importing}>
              {importing ? texts.importing : texts.import}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className={`max-w-2xl ${isRTL ? 'rtl' : 'ltr'}`}>
          <DialogHeader>
            <DialogTitle>{texts.exportOptions}</DialogTitle>
            <DialogDescription>
              {isRTL ? 'اختر خيارات التصدير' : 'Choose export options'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {exportOptions.encryption && (
              <div className="space-y-2">
                <Label>{texts.password}</Label>
                <Input type="password" placeholder={isRTL ? 'أدخل كلمة مرور للتشفير' : 'Enter encryption password'} />
              </div>
            )}

            {exporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{texts.progress}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)} disabled={exporting}>
              {texts.cancel}
            </Button>
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? texts.exporting : texts.export}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
