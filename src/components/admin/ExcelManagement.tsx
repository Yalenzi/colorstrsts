'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  errors: string[];
  data?: any[];
}

interface ExportOptions {
  includeUsers: boolean;
  includeTests: boolean;
  includeSubscriptions: boolean;
  includeRevenue: boolean;
  dateRange: {
    start: string;
    end: string;
  };
}

export function ExcelManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeUsers: true,
    includeTests: true,
    includeSubscriptions: true,
    includeRevenue: true,
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error(isRTL ? 'يرجى اختيار ملف Excel أو CSV' : 'Please select an Excel or CSV file');
      return;
    }

    setImporting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setImportProgress(25);

      // معالجة البيانات
      const result = await processImportData(jsonData);
      setImportProgress(100);
      setImportResult(result);

      if (result.success) {
        toast.success(isRTL 
          ? `تم استيراد ${result.successfulRows} من ${result.totalRows} صف بنجاح`
          : `Successfully imported ${result.successfulRows} of ${result.totalRows} rows`
        );
      } else {
        toast.error(isRTL ? 'فشل في استيراد البيانات' : 'Failed to import data');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(isRTL ? 'خطأ في قراءة الملف' : 'Error reading file');
      setImportResult({
        success: false,
        totalRows: 0,
        successfulRows: 0,
        errors: [isRTL ? 'خطأ في قراءة الملف' : 'Error reading file']
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const processImportData = async (data: any[]): Promise<ImportResult> => {
    const errors: string[] = [];
    let successfulRows = 0;

    // محاكاة معالجة البيانات
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // التحقق من صحة البيانات
        if (!row.email || !isValidEmail(row.email)) {
          errors.push(`${isRTL ? 'الصف' : 'Row'} ${i + 1}: ${isRTL ? 'بريد إلكتروني غير صحيح' : 'Invalid email'}`);
          continue;
        }

        // محاكاة حفظ البيانات
        await new Promise(resolve => setTimeout(resolve, 10));
        successfulRows++;
        
        // تحديث التقدم
        setImportProgress(25 + (i / data.length) * 70);
      } catch (error) {
        errors.push(`${isRTL ? 'الصف' : 'Row'} ${i + 1}: ${isRTL ? 'خطأ في المعالجة' : 'Processing error'}`);
      }
    }

    return {
      success: errors.length < data.length / 2, // نجح إذا كان أقل من 50% أخطاء
      totalRows: data.length,
      successfulRows,
      errors: errors.slice(0, 10), // أول 10 أخطاء فقط
      data
    };
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const workbook = XLSX.utils.book_new();

      // تصدير بيانات المستخدمين
      if (exportOptions.includeUsers) {
        const usersData = await generateUsersData();
        const usersSheet = XLSX.utils.json_to_sheet(usersData);
        XLSX.utils.book_append_sheet(workbook, usersSheet, isRTL ? 'المستخدمون' : 'Users');
      }

      // تصدير بيانات الاختبارات
      if (exportOptions.includeTests) {
        const testsData = await generateTestsData();
        const testsSheet = XLSX.utils.json_to_sheet(testsData);
        XLSX.utils.book_append_sheet(workbook, testsSheet, isRTL ? 'الاختبارات' : 'Tests');
      }

      // تصدير بيانات الاشتراكات
      if (exportOptions.includeSubscriptions) {
        const subscriptionsData = await generateSubscriptionsData();
        const subscriptionsSheet = XLSX.utils.json_to_sheet(subscriptionsData);
        XLSX.utils.book_append_sheet(workbook, subscriptionsSheet, isRTL ? 'الاشتراكات' : 'Subscriptions');
      }

      // تصدير بيانات الإيرادات
      if (exportOptions.includeRevenue) {
        const revenueData = await generateRevenueData();
        const revenueSheet = XLSX.utils.json_to_sheet(revenueData);
        XLSX.utils.book_append_sheet(workbook, revenueSheet, isRTL ? 'الإيرادات' : 'Revenue');
      }

      // حفظ الملف
      const fileName = isRTL 
        ? `تقرير_شامل_${new Date().toISOString().split('T')[0]}.xlsx`
        : `comprehensive_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      
      toast.success(isRTL ? 'تم تصدير الملف بنجاح' : 'File exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(isRTL ? 'خطأ في تصدير الملف' : 'Error exporting file');
    } finally {
      setExporting(false);
    }
  };

  const generateUsersData = async () => {
    // محاكاة بيانات المستخدمين
    return [
      {
        [isRTL ? 'البريد الإلكتروني' : 'Email']: 'ahmed@example.com',
        [isRTL ? 'الاسم' : 'Name']: 'أحمد محمد',
        [isRTL ? 'تاريخ التسجيل' : 'Join Date']: '2024-01-15',
        [isRTL ? 'آخر نشاط' : 'Last Active']: '2024-01-20',
        [isRTL ? 'عدد الاختبارات' : 'Tests Count']: 25,
        [isRTL ? 'حالة الاشتراك' : 'Subscription Status']: isRTL ? 'مميز' : 'Premium'
      },
      {
        [isRTL ? 'البريد الإلكتروني' : 'Email']: 'sara@example.com',
        [isRTL ? 'الاسم' : 'Name']: 'سارة أحمد',
        [isRTL ? 'تاريخ التسجيل' : 'Join Date']: '2024-01-10',
        [isRTL ? 'آخر نشاط' : 'Last Active']: '2024-01-19',
        [isRTL ? 'عدد الاختبارات' : 'Tests Count']: 12,
        [isRTL ? 'حالة الاشتراك' : 'Subscription Status']: isRTL ? 'مجاني' : 'Free'
      }
    ];
  };

  const generateTestsData = async () => {
    return [
      {
        [isRTL ? 'نوع الاختبار' : 'Test Type']: isRTL ? 'اختبار ماركيز' : 'Marquis Test',
        [isRTL ? 'عدد الاستخدامات' : 'Usage Count']: 850,
        [isRTL ? 'معدل النجاح' : 'Success Rate']: '95%',
        [isRTL ? 'آخر استخدام' : 'Last Used']: '2024-01-20'
      },
      {
        [isRTL ? 'نوع الاختبار' : 'Test Type']: isRTL ? 'اختبار ميك' : 'Mecke Test',
        [isRTL ? 'عدد الاستخدامات' : 'Usage Count']: 720,
        [isRTL ? 'معدل النجاح' : 'Success Rate']: '92%',
        [isRTL ? 'آخر استخدام' : 'Last Used']: '2024-01-19'
      }
    ];
  };

  const generateSubscriptionsData = async () => {
    return [
      {
        [isRTL ? 'نوع الاشتراك' : 'Subscription Type']: isRTL ? 'شهري' : 'Monthly',
        [isRTL ? 'السعر' : 'Price']: '29 SAR',
        [isRTL ? 'عدد المشتركين' : 'Subscribers']: 180,
        [isRTL ? 'الإيرادات' : 'Revenue']: '5,220 SAR'
      },
      {
        [isRTL ? 'نوع الاشتراك' : 'Subscription Type']: isRTL ? 'سنوي' : 'Yearly',
        [isRTL ? 'السعر' : 'Price']: '299 SAR',
        [isRTL ? 'عدد المشتركين' : 'Subscribers']: 160,
        [isRTL ? 'الإيرادات' : 'Revenue']: '47,840 SAR'
      }
    ];
  };

  const generateRevenueData = async () => {
    return [
      {
        [isRTL ? 'الشهر' : 'Month']: '2024-01',
        [isRTL ? 'الإيرادات' : 'Revenue']: '12,500 SAR',
        [isRTL ? 'المصاريف' : 'Expenses']: '3,200 SAR',
        [isRTL ? 'صافي الربح' : 'Net Profit']: '9,300 SAR'
      },
      {
        [isRTL ? 'الشهر' : 'Month']: '2024-02',
        [isRTL ? 'الإيرادات' : 'Revenue']: '13,200 SAR',
        [isRTL ? 'المصاريف' : 'Expenses']: '3,400 SAR',
        [isRTL ? 'صافي الربح' : 'Net Profit']: '9,800 SAR'
      }
    ];
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        [isRTL ? 'البريد الإلكتروني' : 'email']: 'user@example.com',
        [isRTL ? 'الاسم' : 'name']: isRTL ? 'اسم المستخدم' : 'User Name',
        [isRTL ? 'نوع الاشتراك' : 'subscription_type']: isRTL ? 'مجاني' : 'free',
        [isRTL ? 'تاريخ التسجيل' : 'join_date']: '2024-01-01'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, isRTL ? 'قالب' : 'Template');
    
    const fileName = isRTL ? 'قالب_استيراد_المستخدمين.xlsx' : 'users_import_template.xlsx';
    XLSX.writeFile(workbook, fileName);
    
    toast.success(isRTL ? 'تم تحميل القالب' : 'Template downloaded');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableCellsIcon className="w-5 h-5" />
            {isRTL ? 'إدارة ملفات Excel' : 'Excel File Management'}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* استيراد البيانات */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'استيراد البيانات' : 'Import Data'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <InformationCircleIcon className="h-4 w-4" />
            <AlertDescription>
              {isRTL 
                ? 'يمكنك استيراد بيانات المستخدمين من ملفات Excel أو CSV. تأكد من أن الملف يحتوي على الأعمدة المطلوبة.'
                : 'You can import user data from Excel or CSV files. Make sure the file contains the required columns.'
              }
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              {isRTL ? 'تحميل القالب' : 'Download Template'}
            </Button>

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2"
            >
              <DocumentArrowUpIcon className="w-4 h-4" />
              {importing ? (isRTL ? 'جاري الاستيراد...' : 'Importing...') : (isRTL ? 'اختيار ملف' : 'Select File')}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{isRTL ? 'جاري الاستيراد...' : 'Importing...'}</span>
                <span>{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          )}

          {importResult && (
            <Alert className={importResult.success ? 'border-green-500' : 'border-red-500'}>
              {importResult.success ? (
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    {isRTL 
                      ? `تم معالجة ${importResult.totalRows} صف، نجح ${importResult.successfulRows} صف`
                      : `Processed ${importResult.totalRows} rows, ${importResult.successfulRows} successful`
                    }
                  </p>
                  {importResult.errors.length > 0 && (
                    <div>
                      <p className="font-medium">{isRTL ? 'الأخطاء:' : 'Errors:'}</p>
                      <ul className="list-disc list-inside text-sm">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* تصدير البيانات */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'تصدير البيانات' : 'Export Data'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">{isRTL ? 'البيانات المراد تصديرها' : 'Data to Export'}</h4>
              <div className="space-y-2">
                {[
                  { key: 'includeUsers', label: isRTL ? 'بيانات المستخدمين' : 'User Data' },
                  { key: 'includeTests', label: isRTL ? 'بيانات الاختبارات' : 'Test Data' },
                  { key: 'includeSubscriptions', label: isRTL ? 'بيانات الاشتراكات' : 'Subscription Data' },
                  { key: 'includeRevenue', label: isRTL ? 'بيانات الإيرادات' : 'Revenue Data' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportOptions[key as keyof ExportOptions] as boolean}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">{isRTL ? 'فترة التصدير' : 'Export Period'}</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm">{isRTL ? 'من تاريخ' : 'From Date'}</label>
                  <input
                    type="date"
                    value={exportOptions.dateRange.start}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm">{isRTL ? 'إلى تاريخ' : 'To Date'}</label>
                  <input
                    type="date"
                    value={exportOptions.dateRange.end}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={exportToExcel}
            disabled={exporting || (!exportOptions.includeUsers && !exportOptions.includeTests && !exportOptions.includeSubscriptions && !exportOptions.includeRevenue)}
            className="flex items-center gap-2"
          >
            {exporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <DocumentArrowDownIcon className="w-4 h-4" />
            )}
            {exporting ? (isRTL ? 'جاري التصدير...' : 'Exporting...') : (isRTL ? 'تصدير إلى Excel' : 'Export to Excel')}
          </Button>
        </CardContent>
      </Card>

      {/* إرشادات الاستخدام */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'إرشادات الاستخدام' : 'Usage Guidelines'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium">{isRTL ? 'للاستيراد:' : 'For Import:'}</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>{isRTL ? 'استخدم القالب المتوفر لضمان التوافق' : 'Use the provided template to ensure compatibility'}</li>
                <li>{isRTL ? 'تأكد من صحة البريد الإلكتروني في كل صف' : 'Ensure valid email addresses in each row'}</li>
                <li>{isRTL ? 'الحد الأقصى 1000 صف في الملف الواحد' : 'Maximum 1000 rows per file'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">{isRTL ? 'للتصدير:' : 'For Export:'}</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>{isRTL ? 'اختر البيانات المطلوبة لتقليل حجم الملف' : 'Select required data to reduce file size'}</li>
                <li>{isRTL ? 'حدد فترة زمنية مناسبة للحصول على بيانات دقيقة' : 'Set appropriate date range for accurate data'}</li>
                <li>{isRTL ? 'الملف سيحتوي على أوراق منفصلة لكل نوع بيانات' : 'File will contain separate sheets for each data type'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}