// دوال آمنة للتعامل مع النصوص
// Safe String Utilities

/**
 * تحويل آمن للنص إلى أحرف صغيرة
 * Safe conversion to lowercase
 */
export function safeToLowerCase(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  try {
    return String(value).toLowerCase();
  } catch (error) {
    console.warn('⚠️ Error in safeToLowerCase:', error);
    return '';
  }
}

/**
 * تحويل آمن للنص إلى أحرف كبيرة
 * Safe conversion to uppercase
 */
export function safeToUpperCase(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  try {
    return String(value).toUpperCase();
  } catch (error) {
    console.warn('⚠️ Error in safeToUpperCase:', error);
    return '';
  }
}

/**
 * تحويل آمن إلى نص
 * Safe conversion to string
 */
export function safeToString(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  try {
    return String(value);
  } catch (error) {
    console.warn('⚠️ Error in safeToString:', error);
    return defaultValue;
  }
}

/**
 * فحص آمن لوجود النص
 * Safe check for string existence
 */
export function isValidString(value: any): boolean {
  return value !== null && value !== undefined && typeof value === 'string' && value.trim().length > 0;
}

/**
 * تقطيع آمن للنص
 * Safe string splitting
 */
export function safeSplit(value: any, separator: string = ','): string[] {
  if (!isValidString(value)) {
    return [];
  }
  
  try {
    return String(value).split(separator).map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.warn('⚠️ Error in safeSplit:', error);
    return [];
  }
}

/**
 * بحث آمن في النص
 * Safe string search
 */
export function safeIncludes(text: any, searchTerm: any): boolean {
  if (!isValidString(text) || !isValidString(searchTerm)) {
    return false;
  }
  
  try {
    return safeToLowerCase(text).includes(safeToLowerCase(searchTerm));
  } catch (error) {
    console.warn('⚠️ Error in safeIncludes:', error);
    return false;
  }
}

/**
 * تحويل آمن لمستوى الثقة
 * Safe confidence level conversion
 */
export function safeConfidenceLevel(level: any): string {
  const levelStr = safeToLowerCase(level);
  
  const validLevels = ['very_low', 'low', 'medium', 'high', 'very_high'];
  
  if (validLevels.includes(levelStr)) {
    return levelStr;
  }
  
  // محاولة تحويل الأرقام
  const num = parseFloat(safeToString(level));
  if (!isNaN(num)) {
    if (num >= 90) return 'very_high';
    if (num >= 80) return 'high';
    if (num >= 60) return 'medium';
    if (num >= 40) return 'low';
    return 'very_low';
  }
  
  return 'medium'; // القيمة الافتراضية
}

/**
 * تحويل آمن لمستوى الثقة إلى رقم
 * Safe confidence level to number conversion
 */
export function safeConfidenceToNumber(level: any): number {
  const levelStr = safeConfidenceLevel(level);
  
  switch (levelStr) {
    case 'very_high': return 95;
    case 'high': return 85;
    case 'medium': return 75;
    case 'low': return 60;
    case 'very_low': return 50;
    default: return 75;
  }
}

/**
 * تنظيف آمن للبيانات
 * Safe data cleaning
 */
export function cleanData(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => cleanData(item));
  }
  
  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      cleaned[key] = cleanData(value);
    }
    return cleaned;
  }
  
  if (typeof data === 'string') {
    return data.trim();
  }
  
  return data;
}

/**
 * استخراج آمن للمواد من النص
 * Safe substance extraction from text
 */
export function extractSubstances(substanceText: any): string[] {
  if (!isValidString(substanceText)) {
    return [];
  }
  
  try {
    // إذا كان array بالفعل
    if (Array.isArray(substanceText)) {
      return substanceText.map(s => safeToString(s)).filter(s => s.length > 0);
    }
    
    // تقطيع النص
    const substances = safeSplit(substanceText, ',');
    
    // تنظيف وفلترة
    return substances
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter(s => s !== 'Unknown' && s !== 'غير معروف');
      
  } catch (error) {
    console.warn('⚠️ Error extracting substances:', error);
    return [];
  }
}

/**
 * تحويل آمن للون hex
 * Safe hex color conversion
 */
export function safeHexColor(color: any): string {
  const colorStr = safeToString(color);
  
  // فحص إذا كان hex color صحيح
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  if (hexPattern.test(colorStr)) {
    return colorStr;
  }
  
  // محاولة إضافة # إذا كان مفقود
  if (/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorStr)) {
    return `#${colorStr}`;
  }
  
  // القيمة الافتراضية
  return '#808080';
}

/**
 * فحص آمن للبيانات المطلوبة
 * Safe validation for required data
 */
export function validateRequiredFields(data: any, requiredFields: string[]): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  if (!data || typeof data !== 'object') {
    return { isValid: false, missingFields: requiredFields };
  }
  
  for (const field of requiredFields) {
    if (!isValidString(data[field])) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * دمج آمن للبيانات
 * Safe data merging
 */
export function safeMerge(target: any, source: any): any {
  if (!target || typeof target !== 'object') {
    return cleanData(source);
  }
  
  if (!source || typeof source !== 'object') {
    return cleanData(target);
  }
  
  const merged = { ...target };
  
  for (const [key, value] of Object.entries(source)) {
    if (value !== null && value !== undefined) {
      merged[key] = cleanData(value);
    }
  }
  
  return merged;
}
