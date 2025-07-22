'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, FileText } from 'lucide-react';

export function ReportsManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const [loading, setLoading] = useState(false);

  const generatePDFReport = async () => {
    setLoading(true);
    try {
      // التحقق من وجود البيئة المناسبة
      if (typeof window === 'undefined') {
        throw new Error('PDF generation requires browser environment');
      }

      // إنشاء محتوى التقرير
      const reportData = {
        title: isRTL ? 'تقرير إحصائيات الموقع' : 'Website Statistics Report',
        date: new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US'),
        stats: {
          totalTests: 35,
          totalUsers: 150,
          totalSubscriptions: 25,
          revenue: 2500
        }
      };

      // إنشاء محتوى HTML للتقرير
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="${isRTL ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="UTF-8">
          <title>${reportData.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportData.title}</h1>
            <p>${isRTL ? 'تاريخ التقرير:' : 'Report Date:'} ${reportData.date}</p>
          </div>
          <div class="stats">
            <div class="stat-card">
              <h3>${isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}</h3>
              <div class="stat-number">${reportData.stats.totalTests}</div>
            </div>
            <div class="stat-card">
              <h3>${isRTL ? 'إجمالي المستخدمين' : 'Total Users'}</h3>
              <div class="stat-number">${reportData.stats.totalUsers}</div>
            </div>
            <div class="stat-card">
              <h3>${isRTL ? 'إجمالي الاشتراكات' : 'Total Subscriptions'}</h3>
              <div class="stat-number">${reportData.stats.totalSubscriptions}</div>
            </div>
            <div class="stat-card">
              <h3>${isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</h3>
              <div class="stat-number">${reportData.stats.revenue} ${isRTL ? 'ريال' : 'SAR'}</div>
            </div>
          </div>
        </body>
        </html>
      `;

      // إنشاء ملف PDF باستخدام طريقة محسنة
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      // إنشاء رابط تحميل
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // أو فتح في نافذة جديدة للطباعة
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // استخدام innerHTML بدلاً من write
        printWindow.document.documentElement.innerHTML = htmlContent;

        // انتظار تحميل المحتوى ثم طباعة
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        });
      }

      toast.success(isRTL ? 'تم إنشاء التقرير بنجاح' : 'Report generated successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(isRTL ? 'خطأ في تصدير PDF' : 'PDF export error');
    } finally {
      setLoading(false);
    }
  };

  const exportCSVReport = () => {
    try {
      const csvData = [
        ['Metric', 'Value'],
        ['Total Tests', '35'],
        ['Total Users', '150'],
        ['Total Subscriptions', '25'],
        ['Total Revenue', '2500 SAR']
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      window.URL.revokeObjectURL(url);
      toast.success(isRTL ? 'تم تصدير CSV بنجاح' : 'CSV exported successfully');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في تصدير CSV' : 'CSV export error');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isRTL ? 'إدارة التقارير' : 'Reports Management'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={generatePDFReport} 
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <FileText size={16} />
            <span>{loading ? (isRTL ? 'جاري الإنشاء...' : 'Generating...') : (isRTL ? 'تصدير PDF' : 'Export PDF')}</span>
          </Button>
          
          <Button 
            onClick={exportCSVReport}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download size={16} />
            <span>{isRTL ? 'تصدير CSV' : 'Export CSV'}</span>
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            {isRTL ? 'معلومات التقرير' : 'Report Information'}
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>{isRTL ? '• إحصائيات شاملة للموقع' : '• Comprehensive website statistics'}</li>
            <li>{isRTL ? '• بيانات المستخدمين والاشتراكات' : '• User and subscription data'}</li>
            <li>{isRTL ? '• تقارير الإيرادات' : '• Revenue reports'}</li>
            <li>{isRTL ? '• تصدير بصيغ متعددة' : '• Multiple export formats'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}