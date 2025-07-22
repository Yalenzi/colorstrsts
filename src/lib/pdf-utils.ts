import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ReportData {
  totalTests: number;
  testsByType: { [key: string]: number };
  dailyUsage: { date: string; count: number }[];
  popularTests: { testId: string; count: number; name: string }[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: {
    testType: string;
    reportType: string;
  };
}

export interface PDFOptions {
  title: string;
  subtitle?: string;
  language: 'ar' | 'en';
  orientation?: 'portrait' | 'landscape';
  includeCharts?: boolean;
}

/**
 * Generate PDF report from data
 */
export async function generatePDFReport(
  data: ReportData,
  options: PDFOptions
): Promise<void> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in browser environment');
    }

    // Validate input data
    if (!data) {
      throw new Error('Report data is required');
    }

    // Check if jsPDF is available
    if (typeof jsPDF === 'undefined') {
      console.warn('jsPDF not available, using fallback method');
      return generateFallbackReport(data, options);
    }

    // Clean and validate data to prevent undefined values
    const cleanData: ReportData = {
      totalTests: data.totalTests || 0,
      testsByType: data.testsByType || {},
      dailyUsage: (data.dailyUsage || []).filter(item => item && item.date && typeof item.count === 'number'),
      popularTests: (data.popularTests || []).filter(item => item && item.testId && item.name && typeof item.count === 'number'),
      dateRange: data.dateRange || {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      filters: data.filters || {
        testType: 'all',
        reportType: 'summary'
      }
    };

    console.log('📊 Generating PDF with clean data:', cleanData);

    // Create PDF document
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const isRTL = options.language === 'ar';
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Set default font
    doc.setFont('helvetica');
    doc.setFontSize(12);

    let yPosition = margin;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    
    if (isRTL) {
      doc.text(options.title, pageWidth - margin, yPosition, { align: 'right' });
    } else {
      doc.text(options.title, margin, yPosition);
    }
    
    yPosition += 15;

    if (options.subtitle) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      
      if (isRTL) {
        doc.text(options.subtitle, pageWidth - margin, yPosition, { align: 'right' });
      } else {
        doc.text(options.subtitle, margin, yPosition);
      }
      
      yPosition += 10;
    }

    // Date and filters info
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    
    const reportDate = new Date().toLocaleDateString(
      isRTL ? 'ar-SA' : 'en-US'
    );
    
    const dateText = isRTL 
      ? `تاريخ التقرير: ${reportDate}`
      : `Report Date: ${reportDate}`;
    
    if (isRTL) {
      doc.text(dateText, pageWidth - margin, yPosition, { align: 'right' });
    } else {
      doc.text(dateText, margin, yPosition);
    }
    
    yPosition += 20;

    // Summary Statistics
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    
    const summaryTitle = isRTL ? 'ملخص الإحصائيات' : 'Summary Statistics';
    
    if (isRTL) {
      doc.text(summaryTitle, pageWidth - margin, yPosition, { align: 'right' });
    } else {
      doc.text(summaryTitle, margin, yPosition);
    }
    
    yPosition += 15;

    // Statistics table with safe data handling
    const statsData = [
      [
        isRTL ? 'إجمالي الاختبارات' : 'Total Tests',
        (data.totalTests || 0).toString()
      ],
      [
        isRTL ? 'أنواع الاختبارات' : 'Test Types',
        Object.keys(data.testsByType || {}).length.toString()
      ],
      [
        isRTL ? 'متوسط الاستخدام اليومي' : 'Daily Average Usage',
        data.dailyUsage && data.dailyUsage.length > 0
          ? Math.round(
              data.dailyUsage.reduce((sum, day) => sum + (day.count || 0), 0) /
              data.dailyUsage.length
            ).toString()
          : '0'
      ]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [[
        isRTL ? 'المؤشر' : 'Metric',
        isRTL ? 'القيمة' : 'Value'
      ]],
      body: statsData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        textColor: [40, 40, 40]
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto'
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Popular Tests Section
    if (data.popularTests && data.popularTests.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);

      const popularTitle = isRTL
        ? 'الاختبارات الأكثر استخداماً'
        : 'Most Popular Tests';

      if (isRTL) {
        doc.text(popularTitle, pageWidth - margin, yPosition, { align: 'right' });
      } else {
        doc.text(popularTitle, margin, yPosition);
      }

      yPosition += 15;

      const popularTestsData = data.popularTests.map(test => [
        test.name || 'Unknown Test',
        (test.count || 0).toString(),
        data.totalTests > 0
          ? `${(((test.count || 0) / data.totalTests) * 100).toFixed(1)}%`
          : '0%'
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [[
          isRTL ? 'اسم الاختبار' : 'Test Name',
          isRTL ? 'عدد الاستخدامات' : 'Usage Count',
          isRTL ? 'النسبة المئوية' : 'Percentage'
        ]],
        body: popularTestsData,
        theme: 'striped',
        styles: {
          fontSize: 10,
          cellPadding: 5,
          textColor: [40, 40, 40]
        },
        headStyles: {
          fillColor: [92, 184, 92],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: margin, right: margin }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Tests by Type Section
    if (data.testsByType && Object.keys(data.testsByType).length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      
      const testsByTypeTitle = isRTL 
        ? 'الاختبارات حسب النوع' 
        : 'Tests by Type';
      
      if (isRTL) {
        doc.text(testsByTypeTitle, pageWidth - margin, yPosition, { align: 'right' });
      } else {
        doc.text(testsByTypeTitle, margin, yPosition);
      }
      
      yPosition += 15;

      const testsByTypeData = Object.entries(data.testsByType).map(([type, count]) => [
        type.charAt(0).toUpperCase() + type.slice(1),
        count.toString(),
        `${((count / data.totalTests) * 100).toFixed(1)}%`
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [[
          isRTL ? 'نوع الاختبار' : 'Test Type',
          isRTL ? 'العدد' : 'Count',
          isRTL ? 'النسبة المئوية' : 'Percentage'
        ]],
        body: testsByTypeData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5,
          textColor: [40, 40, 40]
        },
        headStyles: {
          fillColor: [240, 173, 78],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: margin, right: margin }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      
      const footerText = isRTL 
        ? `صفحة ${i} من ${pageCount} - تم إنشاؤه بواسطة نظام اختبار الألوان`
        : `Page ${i} of ${pageCount} - Generated by Color Testing System`;
      
      if (isRTL) {
        doc.text(footerText, pageWidth - margin, pageHeight - 10, { align: 'right' });
      } else {
        doc.text(footerText, margin, pageHeight - 10);
      }
    }

    // Save the PDF
    const fileName = `${options.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

    // Try to save the PDF with error handling
    try {
      doc.save(fileName);
      console.log('✅ PDF saved successfully:', fileName);
    } catch (saveError) {
      console.error('Error saving PDF:', saveError);
      // Fallback: try to download as blob
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

  } catch (error) {
    console.error('Error generating PDF report:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('jsPDF')) {
        throw new Error('PDF library not available. Please refresh the page and try again.');
      } else if (error.message.includes('browser')) {
        throw new Error('PDF generation requires a browser environment.');
      }
    }

    throw new Error('Failed to generate PDF report. Please try again.');
  }
}

/**
 * Generate simple data export PDF
 */
export function generateDataExportPDF(
  data: any[],
  title: string,
  language: 'ar' | 'en' = 'en'
): void {
  try {
    // Validate and clean input data
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid data provided for PDF export');
    }

    if (!title || typeof title !== 'string') {
      title = language === 'ar' ? 'تقرير البيانات' : 'Data Report';
    }

    // Clean data to remove undefined values
    const cleanData = data.filter(item => item && typeof item === 'object').map(item => {
      const cleanItem: any = {};
      Object.keys(item).forEach(key => {
        const value = item[key];
        if (value !== undefined && value !== null && value !== 'undefined') {
          cleanItem[key] = String(value); // Convert to string to ensure compatibility
        } else {
          cleanItem[key] = language === 'ar' ? 'غير محدد' : 'Not specified';
        }
      });
      return cleanItem;
    });

    console.log(`📄 Generating PDF export with ${cleanData.length} clean records`);

    const doc = new jsPDF();
    const isRTL = language === 'ar';
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Title
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    
    if (isRTL) {
      doc.text(title, pageWidth - margin, margin, { align: 'right' });
    } else {
      doc.text(title, margin, margin);
    }

    // Date
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    const dateText = new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
    
    if (isRTL) {
      doc.text(dateText, pageWidth - margin, margin + 10, { align: 'right' });
    } else {
      doc.text(dateText, margin, margin + 10);
    }

    // Data table
    if (cleanData.length > 0) {
      const headers = Object.keys(cleanData[0]);
      const rows = cleanData.map(item =>
        headers.map(header => {
          const value = item[header];
          return value !== undefined && value !== null ? String(value) : '';
        })
      );

      doc.autoTable({
        startY: margin + 25,
        head: [headers],
        body: rows,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [40, 40, 40],
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          // Ensure all columns handle text properly
          0: { cellWidth: 'auto' }
        }
      });
    } else {
      // Add message if no data
      doc.setFontSize(12);
      doc.setTextColor(120, 120, 120);
      const noDataText = language === 'ar' ? 'لا توجد بيانات للعرض' : 'No data to display';
      doc.text(noDataText, margin, margin + 40);
    }

    // Save
    const fileName = `${title.replace(/\s+/g, '-').toLowerCase()}-export.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating data export PDF:', error);
    throw error;
  }
}

/**
 * Fallback method for PDF generation when jsPDF is not available
 */
async function generateFallbackReport(data: ReportData, options: PDFOptions): Promise<void> {
  try {
    const isRTL = options.language === 'ar';

    // Create HTML content for the report
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${options.language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${options.title}</title>
        <style>
          body {
            font-family: ${isRTL ? 'Tahoma, Arial' : 'Arial, sans-serif'};
            margin: 20px;
            line-height: 1.6;
            color: #333;
            direction: ${isRTL ? 'rtl' : 'ltr'};
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          .stat-card {
            border: 1px solid #e5e7eb;
            padding: 20px;
            border-radius: 8px;
            background: #f9fafb;
            text-align: center;
          }
          .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin: 10px 0;
          }
          .stat-label {
            color: #6b7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .table th,
          .table td {
            padding: 12px 15px;
            text-align: ${isRTL ? 'right' : 'left'};
            border-bottom: 1px solid #e5e7eb;
          }
          .table th {
            background: #2563eb;
            color: white;
            font-weight: bold;
          }
          .table tr:hover {
            background: #f9fafb;
          }
          .section {
            margin: 40px 0;
          }
          .section h2 {
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          .print-button {
            position: fixed;
            top: 20px;
            ${isRTL ? 'left' : 'right'}: 20px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
          }
          .print-button:hover {
            background: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">
          ${isRTL ? '🖨️ طباعة' : '🖨️ Print'}
        </button>

        <div class="header">
          <h1>${options.title}</h1>
          ${options.subtitle ? `<p>${options.subtitle}</p>` : ''}
          <p>${isRTL ? 'تاريخ التقرير:' : 'Report Date:'} ${new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">${isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}</div>
            <div class="stat-number">${data.totalTests}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${isRTL ? 'أنواع الاختبارات' : 'Test Types'}</div>
            <div class="stat-number">${Object.keys(data.testsByType).length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${isRTL ? 'الاختبارات الشائعة' : 'Popular Tests'}</div>
            <div class="stat-number">${data.popularTests.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${isRTL ? 'الاستخدام اليومي' : 'Daily Usage'}</div>
            <div class="stat-number">${data.dailyUsage.reduce((sum, day) => sum + day.count, 0)}</div>
          </div>
        </div>

        <div class="section">
          <h2>${isRTL ? 'الاختبارات حسب النوع' : 'Tests by Type'}</h2>
          <table class="table">
            <thead>
              <tr>
                <th>${isRTL ? 'نوع الاختبار' : 'Test Type'}</th>
                <th>${isRTL ? 'عدد الاستخدامات' : 'Usage Count'}</th>
                <th>${isRTL ? 'النسبة المئوية' : 'Percentage'}</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(data.testsByType).map(([testType, count]) => {
                const percentage = ((count / data.totalTests) * 100).toFixed(1);
                return `
                  <tr>
                    <td>${testType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                    <td>${count}</td>
                    <td>${percentage}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        ${data.popularTests.length > 0 ? `
        <div class="section">
          <h2>${isRTL ? 'الاختبارات الأكثر شيوعاً' : 'Most Popular Tests'}</h2>
          <table class="table">
            <thead>
              <tr>
                <th>${isRTL ? 'اسم الاختبار' : 'Test Name'}</th>
                <th>${isRTL ? 'عدد الاستخدامات' : 'Usage Count'}</th>
                <th>${isRTL ? 'النسبة المئوية' : 'Percentage'}</th>
              </tr>
            </thead>
            <tbody>
              ${data.popularTests.map(test => {
                const percentage = ((test.count / data.totalTests) * 100).toFixed(1);
                return `
                  <tr>
                    <td>${test.name}</td>
                    <td>${test.count}</td>
                    <td>${percentage}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.dailyUsage.length > 0 ? `
        <div class="section">
          <h2>${isRTL ? 'الاستخدام اليومي' : 'Daily Usage'}</h2>
          <table class="table">
            <thead>
              <tr>
                <th>${isRTL ? 'التاريخ' : 'Date'}</th>
                <th>${isRTL ? 'عدد الاختبارات' : 'Test Count'}</th>
              </tr>
            </thead>
            <tbody>
              ${data.dailyUsage.map(day => `
                <tr>
                  <td>${new Date(day.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</td>
                  <td>${day.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="section" style="margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>${isRTL ? 'تم إنشاء هذا التقرير بواسطة نظام إدارة الاختبارات الكيميائية' : 'Generated by Chemical Tests Management System'}</p>
          <p>${new Date().toLocaleString(isRTL ? 'ar-SA' : 'en-US')}</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then focus for printing
      printWindow.onload = () => {
        printWindow.focus();
      };
    } else {
      // Fallback: download as HTML file
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${options.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    console.log('✅ Fallback report generated successfully');

  } catch (error) {
    console.error('Error in fallback report generation:', error);
    throw new Error('Failed to generate report using fallback method');
  }
}
