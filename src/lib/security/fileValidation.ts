import { sanitizeFileName } from './sanitization';

// File type configurations
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'text/plain', 'text/csv', 'application/json'],
  data: ['application/json', 'text/csv', 'application/vnd.ms-excel']
};

export const ALLOWED_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  documents: ['.pdf', '.txt', '.csv', '.json'],
  data: ['.json', '.csv', '.xls']
};

export const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  data: 2 * 1024 * 1024 // 2MB
};

// File signature (magic numbers) for validation
export const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'text/plain': [], // Text files don't have consistent signatures
  'application/json': [], // JSON files are text-based
  'text/csv': [] // CSV files are text-based
};

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedName: string;
  detectedType: string | null;
}

/**
 * Validate file upload security
 */
export async function validateFileUpload(
  file: File,
  allowedTypes: string[] = [...ALLOWED_FILE_TYPES.images, ...ALLOWED_FILE_TYPES.documents],
  maxSize: number = MAX_FILE_SIZES.document
): Promise<FileValidationResult> {
  const errors: string[] = [];
  let isValid = true;

  // Sanitize file name
  const sanitizedName = sanitizeFileName(file.name);
  if (!sanitizedName) {
    errors.push('Invalid file name');
    isValid = false;
  }

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`);
    isValid = false;
  }

  if (file.size === 0) {
    errors.push('File is empty');
    isValid = false;
  }

  // Check file extension
  const extension = getFileExtension(file.name).toLowerCase();
  const allowedExtensions = getAllowedExtensions(allowedTypes);
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed`);
    isValid = false;
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
    isValid = false;
  }

  // Validate file signature (magic numbers)
  let detectedType: string | null = null;
  try {
    detectedType = await validateFileSignature(file);
    if (detectedType && detectedType !== file.type) {
      errors.push(`File content does not match declared type. Expected: ${file.type}, Detected: ${detectedType}`);
      isValid = false;
    }
  } catch (error) {
    errors.push('Unable to validate file content');
    isValid = false;
  }

  // Check for directory traversal attempts
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    errors.push('File name contains invalid path characters');
    isValid = false;
  }

  // Check for executable file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.php', '.asp', '.jsp'];
  if (dangerousExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
    errors.push('Executable files are not allowed');
    isValid = false;
  }

  return {
    isValid,
    errors,
    sanitizedName,
    detectedType
  };
}

/**
 * Validate file signature by reading the first few bytes
 */
async function validateFileSignature(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer.slice(0, 8)); // Read first 8 bytes
        
        // Check against known signatures
        for (const [mimeType, signature] of Object.entries(FILE_SIGNATURES)) {
          if (signature.length === 0) continue; // Skip text-based files
          
          if (signature.every((byte, index) => bytes[index] === byte)) {
            resolve(mimeType);
            return;
          }
        }
        
        // For text-based files, try to validate content
        if (file.type.startsWith('text/') || file.type === 'application/json') {
          const text = new TextDecoder().decode(arrayBuffer.slice(0, 1024));
          if (isValidTextContent(text, file.type)) {
            resolve(file.type);
            return;
          }
        }
        
        resolve(null);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
}

/**
 * Validate text content for text-based files
 */
function isValidTextContent(content: string, mimeType: string): boolean {
  try {
    // Check for binary content in text files
    if (/[\x00-\x08\x0E-\x1F\x7F]/.test(content)) {
      return false;
    }

    // Validate JSON files
    if (mimeType === 'application/json') {
      JSON.parse(content);
      return true;
    }

    // Validate CSV files
    if (mimeType === 'text/csv') {
      const lines = content.split('\n');
      return lines.length > 0 && lines[0].includes(',');
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
}

/**
 * Get allowed extensions for given MIME types
 */
function getAllowedExtensions(allowedTypes: string[]): string[] {
  const extensions: string[] = [];
  
  allowedTypes.forEach(type => {
    if (ALLOWED_FILE_TYPES.images.includes(type)) {
      extensions.push(...ALLOWED_EXTENSIONS.images);
    }
    if (ALLOWED_FILE_TYPES.documents.includes(type)) {
      extensions.push(...ALLOWED_EXTENSIONS.documents);
    }
    if (ALLOWED_FILE_TYPES.data.includes(type)) {
      extensions.push(...ALLOWED_EXTENSIONS.data);
    }
  });
  
  return [...new Set(extensions)]; // Remove duplicates
}

/**
 * Scan file content for malicious patterns
 */
export async function scanFileContent(file: File): Promise<{ isSafe: boolean; threats: string[] }> {
  const threats: string[] = [];
  
  try {
    const text = await file.text();
    
    // Check for script tags
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(text)) {
      threats.push('Contains script tags');
    }
    
    // Check for PHP code
    if (/<\?php/gi.test(text)) {
      threats.push('Contains PHP code');
    }
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi,
      /(\bUNION\b|\bEXEC\b|\bEXECUTE\b)/gi
    ];
    
    sqlPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        threats.push('Contains potential SQL injection patterns');
      }
    });
    
    // Check for suspicious URLs
    if (/https?:\/\/[^\s]+\.(exe|bat|cmd|scr|pif)/gi.test(text)) {
      threats.push('Contains suspicious download links');
    }
    
    return {
      isSafe: threats.length === 0,
      threats
    };
  } catch (error) {
    return {
      isSafe: false,
      threats: ['Unable to scan file content']
    };
  }
}

/**
 * Generate secure filename with timestamp
 */
export function generateSecureFilename(originalName: string, userId?: string): string {
  const sanitized = sanitizeFileName(originalName);
  const extension = getFileExtension(sanitized);
  const nameWithoutExt = sanitized.replace(extension, '');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  const userPrefix = userId ? `${userId.substring(0, 8)}_` : '';
  
  return `${userPrefix}${nameWithoutExt}_${timestamp}_${randomSuffix}${extension}`;
}

/**
 * Validate image dimensions and content
 */
export async function validateImageFile(file: File): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  if (!file.type.startsWith('image/')) {
    errors.push('File is not an image');
    return { isValid: false, errors };
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = function() {
      URL.revokeObjectURL(url);
      
      // Check image dimensions
      if (img.width > 4096 || img.height > 4096) {
        errors.push('Image dimensions exceed maximum allowed size (4096x4096)');
      }
      
      if (img.width < 10 || img.height < 10) {
        errors.push('Image dimensions are too small (minimum 10x10)');
      }
      
      resolve({ isValid: errors.length === 0, errors });
    };
    
    img.onerror = function() {
      URL.revokeObjectURL(url);
      errors.push('Invalid image file');
      resolve({ isValid: false, errors });
    };
    
    img.src = url;
  });
}
