import * as ExcelJS from 'exceljs';

export interface ExcelData {
  headers: string[];
  rows: string[][];
  fileName: string;
  fileSize: string;
  rowCount: number;
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
}

export interface ExcelValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data: ExcelData | null;
}

// Expected headers for comprehensive chemical test data
export const EXPECTED_HEADERS = [
  'test_id',
  'test_name',
  'test_name_ar',
  'description',
  'description_ar',
  'category',
  'difficulty',
  'safety_level',
  'steps',
  'steps_ar',
  'materials',
  'materials_ar',
  'color_result',
  'color_result_ar',
  'color_hex',
  'possible_substance',
  'possible_substance_ar',
  'confidence_level',
  'reference',
  'created_at',
  'updated_at'
];

// Required headers (must be present)
export const REQUIRED_HEADERS = [
  'test_id',
  'test_name',
  'test_name_ar',
  'category',
  'color_result',
  'color_hex',
  'possible_substance'
];

/**
 * Read and parse Excel file using ExcelJS (secure alternative to XLSX)
 */
export async function readExcelFile(file: File): Promise<ExcelData> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    // Get first worksheet
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('No worksheet found in file');
    }

    const jsonData: string[][] = [];

    // Convert worksheet to array format
    worksheet.eachRow((row, rowNumber) => {
      const rowData: string[] = [];
      row.eachCell((cell, colNumber) => {
        // Convert cell value to string
        const cellValue = cell.value;
        if (cellValue === null || cellValue === undefined) {
          rowData[colNumber - 1] = '';
        } else if (typeof cellValue === 'object' && 'text' in cellValue) {
          // Handle rich text
          rowData[colNumber - 1] = cellValue.text || '';
        } else {
          rowData[colNumber - 1] = String(cellValue);
        }
      });
      jsonData.push(rowData);
    });

    if (jsonData.length === 0) {
      throw new Error('Empty file');
    }

    const headers = jsonData[0] || [];
    const rows = jsonData.slice(1);

    const excelData: ExcelData = {
      headers,
      rows,
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      rowCount: rows.length
    };

    return excelData;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw new Error(`Failed to read Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate Excel data structure and content
 */
export function validateExcelData(data: ExcelData, lang: 'ar' | 'en' = 'en'): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check required headers
  REQUIRED_HEADERS.forEach(header => {
    if (!data.headers.includes(header)) {
      errors.push({
        row: 0,
        column: header,
        message: lang === 'ar' 
          ? `العمود المطلوب "${header}" غير موجود`
          : `Required column "${header}" is missing`
      });
    }
  });
  
  // Check data rows
  data.rows.forEach((row, index) => {
    const rowNumber = index + 1;
    
    // Check row length
    if (row.length !== data.headers.length) {
      errors.push({
        row: rowNumber,
        column: 'general',
        message: lang === 'ar' 
          ? 'عدد الأعمدة غير متطابق'
          : 'Column count mismatch'
      });
    }
    
    // Check required fields
    REQUIRED_HEADERS.forEach(header => {
      const columnIndex = data.headers.indexOf(header);
      if (columnIndex !== -1) {
        const cellValue = row[columnIndex];
        if (!cellValue || cellValue.toString().trim() === '') {
          errors.push({
            row: rowNumber,
            column: header,
            message: lang === 'ar' 
              ? `الحقل المطلوب "${header}" فارغ`
              : `Required field "${header}" is empty`
          });
        }
      }
    });
    
    // Validate color hex codes
    const colorHexIndex = data.headers.indexOf('color_hex');
    if (colorHexIndex !== -1) {
      const hexValue = row[colorHexIndex];
      if (hexValue && !isValidHexColor(hexValue.toString())) {
        errors.push({
          row: rowNumber,
          column: 'color_hex',
          message: lang === 'ar' 
            ? 'كود اللون غير صحيح (يجب أن يكون بصيغة #RRGGBB)'
            : 'Invalid hex color code (must be in #RRGGBB format)'
        });
      }
    }
    
    // Validate test_id format
    const testIdIndex = data.headers.indexOf('test_id');
    if (testIdIndex !== -1) {
      const testId = row[testIdIndex];
      if (testId && !isValidTestId(testId.toString())) {
        errors.push({
          row: rowNumber,
          column: 'test_id',
          message: lang === 'ar' 
            ? 'معرف الاختبار غير صحيح (يجب أن يحتوي على أحرف وأرقام وشرطات فقط)'
            : 'Invalid test ID (must contain only letters, numbers, and hyphens)'
        });
      }
    }
  });
  
  return errors;
}

/**
 * Export data to Excel format using ExcelJS (secure alternative)
 */
export async function exportToExcel(data: any[], filename: string = 'export'): Promise<void> {
  try {
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    if (data.length === 0) {
      throw new Error('No data to export');
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Add headers
    worksheet.addRow(headers);

    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF428BCA' }
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    data.forEach(item => {
      const row = headers.map(header => item[header] || '');
      worksheet.addRow(row);
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      if (column.header) {
        column.width = Math.max(column.header.length + 2, 10);
      }
    });

    // Generate Excel file and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

/**
 * Create backup before importing data
 */
export function createBackup(data: any[], backupName: string = 'backup'): void {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      data: data
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${backupName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
}

/**
 * Convert Excel data to database format
 */
export function convertExcelToDatabase(excelData: ExcelData): any[] {
  const result: any[] = [];
  
  excelData.rows.forEach(row => {
    const record: any = {};
    
    excelData.headers.forEach((header, index) => {
      record[header] = row[index] || '';
    });
    
    // Add metadata
    record.id = generateId();
    record.created_at = new Date().toISOString();
    record.updated_at = new Date().toISOString();
    
    result.push(record);
  });
  
  return result;
}

/**
 * Helper functions
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

function isValidTestId(testId: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(testId);
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Get sample Excel template data
 */
export function getSampleExcelData(): any[] {
  return [
    {
      test_id: 'marquis-test',
      test_name: 'Marquis Test',
      test_name_ar: 'اختبار ماركيز',
      description: 'A presumptive test for MDMA and amphetamines using formaldehyde and sulfuric acid',
      description_ar: 'اختبار افتراضي لـ MDMA والأمفيتامينات باستخدام الفورمالديهايد وحمض الكبريتيك',
      category: 'Stimulants',
      difficulty: 'Medium',
      safety_level: 'High Risk',
      steps: '1. Add sample to test tube|2. Add 2 drops of Marquis reagent|3. Observe color change|4. Compare with reference chart',
      steps_ar: '1. أضف العينة إلى أنبوب الاختبار|2. أضف قطرتين من كاشف ماركيز|3. راقب تغير اللون|4. قارن مع مخطط المرجع',
      materials: 'Marquis reagent, test tubes, safety equipment',
      materials_ar: 'كاشف ماركيز، أنابيب اختبار، معدات السلامة',
      color_result: 'Purple to Black',
      color_result_ar: 'بنفسجي إلى أسود',
      color_hex: '#4A0E4E',
      possible_substance: 'MDMA, Amphetamines',
      possible_substance_ar: 'إم دي إم إيه، أمفيتامينات',
      confidence_level: 'High',
      reference: 'DEA Guidelines 2024',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      test_id: 'mecke-test',
      test_name: 'Mecke Test',
      test_name_ar: 'اختبار ميك',
      description: 'A presumptive test for opiates using selenous acid and sulfuric acid',
      description_ar: 'اختبار افتراضي للمواد الأفيونية باستخدام حمض السيلينوز وحمض الكبريتيك',
      category: 'Opiates',
      difficulty: 'Medium',
      safety_level: 'High Risk',
      steps: '1. Place sample in test tube|2. Add 2 drops of Mecke reagent|3. Wait 30 seconds|4. Record color change',
      steps_ar: '1. ضع العينة في أنبوب الاختبار|2. أضف قطرتين من كاشف ميك|3. انتظر 30 ثانية|4. سجل تغير اللون',
      materials: 'Mecke reagent, test tubes, timer, safety gloves',
      materials_ar: 'كاشف ميك، أنابيب اختبار، مؤقت، قفازات السلامة',
      color_result: 'Blue to Green',
      color_result_ar: 'أزرق إلى أخضر',
      color_hex: '#1E90FF',
      possible_substance: 'Heroin, Opiates',
      possible_substance_ar: 'هيروين، مواد أفيونية',
      confidence_level: 'High',
      reference: 'DEA Guidelines 2024',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      test_id: 'ehrlich-test',
      test_name: 'Ehrlich Test',
      test_name_ar: 'اختبار إيرليش',
      description: 'A presumptive test for LSD and other indoles using p-dimethylaminobenzaldehyde',
      description_ar: 'اختبار افتراضي لـ LSD والإندولات الأخرى باستخدام p-dimethylaminobenzaldehyde',
      category: 'Hallucinogens',
      difficulty: 'Easy',
      safety_level: 'Medium Risk',
      steps: '1. Place sample on test surface|2. Add 1 drop of Ehrlich reagent|3. Observe immediate color change|4. Document results',
      steps_ar: '1. ضع العينة على سطح الاختبار|2. أضف قطرة واحدة من كاشف إيرليش|3. راقب تغير اللون الفوري|4. وثق النتائج',
      materials: 'Ehrlich reagent, test surface, documentation materials',
      materials_ar: 'كاشف إيرليش، سطح اختبار، مواد التوثيق',
      color_result: 'Purple to Pink',
      color_result_ar: 'بنفسجي إلى وردي',
      color_hex: '#8B008B',
      possible_substance: 'LSD, Psilocybin',
      possible_substance_ar: 'إل إس دي، سيلوسيبين',
      confidence_level: 'Medium',
      reference: 'Scientific Literature 2024',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

/**
 * Download sample Excel template
 */
export async function downloadSampleTemplate(): Promise<void> {
  const sampleData = getSampleExcelData();
  await exportToExcel(sampleData, 'chemical-tests-template');
}
