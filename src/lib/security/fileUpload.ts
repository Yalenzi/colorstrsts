import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { validateFileUpload, scanFileContent, generateSecureFilename } from './fileValidation';
import { sanitizeFileName } from './sanitization';

export interface SecureUploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
  warnings?: string[];
}

export interface UploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  folder?: string;
  userId?: string;
  scanForMalware?: boolean;
  generateThumbnail?: boolean;
}

/**
 * Secure file upload with comprehensive validation
 */
export async function secureFileUpload(
  file: File,
  options: UploadOptions = {}
): Promise<SecureUploadResult> {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    folder = 'uploads',
    userId,
    scanForMalware = true,
    generateThumbnail = false
  } = options;

  try {
    // Step 1: Validate file
    const validation = await validateFileUpload(file, allowedTypes, maxSize);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    // Step 2: Scan for malicious content
    if (scanForMalware) {
      const scanResult = await scanFileContent(file);
      if (!scanResult.isSafe) {
        return {
          success: false,
          error: `File contains potentially malicious content: ${scanResult.threats.join(', ')}`
        };
      }
    }

    // Step 3: Generate secure filename
    const secureFileName = generateSecureFilename(validation.sanitizedName, userId);
    const filePath = `${folder}/${secureFileName}`;

    // Step 4: Upload to Firebase Storage
    const storageRef = ref(storage, filePath);
    const uploadResult = await uploadBytes(storageRef, file, {
      customMetadata: {
        originalName: validation.sanitizedName,
        uploadedBy: userId || 'anonymous',
        uploadedAt: new Date().toISOString(),
        fileSize: file.size.toString(),
        mimeType: file.type,
        validated: 'true',
        scanned: scanForMalware.toString()
      }
    });

    // Step 5: Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Step 6: Generate thumbnail if requested and file is an image
    let thumbnailUrl: string | undefined;
    if (generateThumbnail && file.type.startsWith('image/')) {
      try {
        thumbnailUrl = await generateImageThumbnail(file, `${folder}/thumbnails/${secureFileName}`);
      } catch (error) {
        console.warn('Failed to generate thumbnail:', error);
      }
    }

    return {
      success: true,
      url: downloadURL,
      fileName: secureFileName,
      warnings: validation.errors.length > 0 ? validation.errors : undefined
    };

  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: 'Upload failed due to server error'
    };
  }
}

/**
 * Generate image thumbnail
 */
async function generateImageThumbnail(file: File, thumbnailPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = async () => {
      try {
        // Calculate thumbnail dimensions (max 200x200)
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const storageRef = ref(storage, thumbnailPath);
            const uploadResult = await uploadBytes(storageRef, blob);
            const thumbnailURL = await getDownloadURL(uploadResult.ref);
            resolve(thumbnailURL);
          } else {
            reject(new Error('Failed to create thumbnail blob'));
          }
        }, 'image/jpeg', 0.8);

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Secure file deletion
 */
export async function secureFileDelete(
  filePath: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate file path to prevent directory traversal
    if (filePath.includes('..') || filePath.includes('//')) {
      return {
        success: false,
        error: 'Invalid file path'
      };
    }

    // Get file metadata to verify ownership
    const storageRef = ref(storage, filePath);
    
    try {
      // Check if user has permission to delete this file
      const metadata = await storageRef.getMetadata();
      if (userId && metadata.customMetadata?.uploadedBy !== userId) {
        return {
          success: false,
          error: 'Permission denied'
        };
      }
    } catch (error) {
      // File doesn't exist or no metadata
      return {
        success: false,
        error: 'File not found'
      };
    }

    // Delete the file
    await deleteObject(storageRef);

    // Also delete thumbnail if it exists
    try {
      const thumbnailPath = filePath.replace('/uploads/', '/uploads/thumbnails/');
      const thumbnailRef = ref(storage, thumbnailPath);
      await deleteObject(thumbnailRef);
    } catch (error) {
      // Thumbnail doesn't exist, ignore
    }

    return { success: true };

  } catch (error) {
    console.error('File deletion error:', error);
    return {
      success: false,
      error: 'Failed to delete file'
    };
  }
}

/**
 * Batch file upload with progress tracking
 */
export async function batchFileUpload(
  files: File[],
  options: UploadOptions = {},
  onProgress?: (progress: number, currentFile: string) => void
): Promise<SecureUploadResult[]> {
  const results: SecureUploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress((i / files.length) * 100, file.name);
    }
    
    const result = await secureFileUpload(file, options);
    results.push(result);
    
    // Add delay between uploads to prevent overwhelming the server
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  if (onProgress) {
    onProgress(100, 'Complete');
  }
  
  return results;
}

/**
 * Get file metadata securely
 */
export async function getFileMetadata(
  filePath: string,
  userId?: string
): Promise<{ success: boolean; metadata?: any; error?: string }> {
  try {
    // Validate file path
    if (filePath.includes('..') || filePath.includes('//')) {
      return {
        success: false,
        error: 'Invalid file path'
      };
    }

    const storageRef = ref(storage, filePath);
    const metadata = await storageRef.getMetadata();

    // Check ownership if userId provided
    if (userId && metadata.customMetadata?.uploadedBy !== userId) {
      return {
        success: false,
        error: 'Permission denied'
      };
    }

    return {
      success: true,
      metadata: {
        name: metadata.name,
        size: metadata.size,
        contentType: metadata.contentType,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        customMetadata: metadata.customMetadata
      }
    };

  } catch (error) {
    console.error('Get metadata error:', error);
    return {
      success: false,
      error: 'Failed to get file metadata'
    };
  }
}

/**
 * Virus scanning integration (placeholder for external service)
 */
async function scanFileForVirus(file: File): Promise<{ clean: boolean; threats: string[] }> {
  // This would integrate with a virus scanning service like VirusTotal, ClamAV, etc.
  // For now, return a basic implementation
  
  try {
    // Basic file extension check
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js'];
    const fileName = file.name.toLowerCase();
    
    for (const ext of dangerousExtensions) {
      if (fileName.endsWith(ext)) {
        return {
          clean: false,
          threats: [`Potentially dangerous file extension: ${ext}`]
        };
      }
    }
    
    // Check file size (extremely large files might be suspicious)
    if (file.size > 100 * 1024 * 1024) { // 100MB
      return {
        clean: false,
        threats: ['File size exceeds security limits']
      };
    }
    
    return { clean: true, threats: [] };
    
  } catch (error) {
    console.error('Virus scan error:', error);
    return {
      clean: false,
      threats: ['Virus scan failed']
    };
  }
}

/**
 * Clean up old uploaded files (should be run periodically)
 */
export async function cleanupOldFiles(
  folder: string = 'uploads',
  maxAgeMs: number = 30 * 24 * 60 * 60 * 1000 // 30 days
): Promise<{ cleaned: number; errors: string[] }> {
  // This would typically be implemented as a Cloud Function
  // For client-side, we can only clean files uploaded by the current user
  
  const errors: string[] = [];
  let cleaned = 0;
  
  try {
    // Implementation would depend on having a way to list files
    // This is a placeholder for the actual implementation
    console.log(`Cleanup would remove files older than ${maxAgeMs}ms from ${folder}`);
    
  } catch (error) {
    errors.push(`Cleanup failed: ${error}`);
  }
  
  return { cleaned, errors };
}
