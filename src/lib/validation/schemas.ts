import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must not exceed 100 characters')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must not exceed 50 characters')
    .regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'Display name can only contain letters and spaces')
    .trim(),
  language: z.enum(['en', 'ar']).default('en')
});

export const userLoginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password must not exceed 128 characters')
});

export const userUpdateSchema = z.object({
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must not exceed 50 characters')
    .regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'Display name can only contain letters and spaces')
    .trim()
    .optional(),
  language: z.enum(['en', 'ar']).optional(),
  photoURL: z.string().url('Invalid photo URL').optional().or(z.literal(''))
});

// Chemical test validation schemas
export const chemicalTestSchema = z.object({
  id: z.string()
    .min(3, 'Test ID must be at least 3 characters')
    .max(50, 'Test ID must not exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Test ID can only contain lowercase letters, numbers, and hyphens'),
  method_name: z.string()
    .min(3, 'Method name must be at least 3 characters')
    .max(100, 'Method name must not exceed 100 characters')
    .trim(),
  method_name_ar: z.string()
    .min(3, 'Arabic method name must be at least 3 characters')
    .max(100, 'Arabic method name must not exceed 100 characters')
    .regex(/^[\u0600-\u06FF\s]+$/, 'Arabic method name must contain only Arabic characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .trim(),
  description_ar: z.string()
    .min(10, 'Arabic description must be at least 10 characters')
    .max(500, 'Arabic description must not exceed 500 characters')
    .trim(),
  category: z.string()
    .min(3, 'Category must be at least 3 characters')
    .max(50, 'Category must not exceed 50 characters')
    .trim(),
  safety_level: z.enum(['low', 'medium', 'high']),
  preparation_time: z.number()
    .min(1, 'Preparation time must be at least 1 minute')
    .max(120, 'Preparation time must not exceed 120 minutes'),
  color_primary: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code'),
  prepare: z.string()
    .min(20, 'Preparation instructions must be at least 20 characters')
    .max(2000, 'Preparation instructions must not exceed 2000 characters')
    .trim(),
  prepare_ar: z.string()
    .min(20, 'Arabic preparation instructions must be at least 20 characters')
    .max(2000, 'Arabic preparation instructions must not exceed 2000 characters')
    .trim(),
  test_type: z.string()
    .min(1, 'Test type is required')
    .max(20, 'Test type must not exceed 20 characters'),
  test_number: z.string()
    .min(1, 'Test number is required')
    .max(20, 'Test number must not exceed 20 characters'),
  color_result: z.string()
    .min(3, 'Color result must be at least 3 characters')
    .max(100, 'Color result must not exceed 100 characters')
    .trim(),
  color_result_ar: z.string()
    .min(3, 'Arabic color result must be at least 3 characters')
    .max(100, 'Arabic color result must not exceed 100 characters')
    .trim(),
  color_hex: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex must be a valid hex color code'),
  possible_substance: z.string()
    .min(3, 'Possible substance must be at least 3 characters')
    .max(200, 'Possible substance must not exceed 200 characters')
    .trim(),
  possible_substance_ar: z.string()
    .min(3, 'Arabic possible substance must be at least 3 characters')
    .max(200, 'Arabic possible substance must not exceed 200 characters')
    .trim(),
  confidence_level: z.enum(['low', 'medium', 'high']),
  reference: z.string()
    .max(500, 'Reference must not exceed 500 characters')
    .trim()
    .optional()
});

// Color result validation schema
export const colorResultSchema = z.object({
  id: z.string()
    .min(3, 'Color result ID must be at least 3 characters')
    .max(50, 'Color result ID must not exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Color result ID can only contain lowercase letters, numbers, and hyphens'),
  test_id: z.string()
    .min(3, 'Test ID must be at least 3 characters')
    .max(50, 'Test ID must not exceed 50 characters'),
  color_result: z.string()
    .min(3, 'Color result must be at least 3 characters')
    .max(100, 'Color result must not exceed 100 characters')
    .trim(),
  color_result_ar: z.string()
    .min(3, 'Arabic color result must be at least 3 characters')
    .max(100, 'Arabic color result must not exceed 100 characters')
    .trim(),
  color_hex: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex must be a valid hex color code'),
  possible_substance: z.string()
    .min(3, 'Possible substance must be at least 3 characters')
    .max(200, 'Possible substance must not exceed 200 characters')
    .trim(),
  possible_substance_ar: z.string()
    .min(3, 'Arabic possible substance must be at least 3 characters')
    .max(200, 'Arabic possible substance must not exceed 200 characters')
    .trim(),
  confidence_level: z.enum(['low', 'medium', 'high'])
});

// File upload validation schema
export const fileUploadSchema = z.object({
  name: z.string()
    .min(1, 'File name is required')
    .max(255, 'File name must not exceed 255 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'File name contains invalid characters'),
  size: z.number()
    .min(1, 'File size must be greater than 0')
    .max(10 * 1024 * 1024, 'File size must not exceed 10MB'), // 10MB limit
  type: z.string()
    .regex(/^(image\/(jpeg|jpg|png|gif|webp)|application\/(pdf|json|csv)|text\/(csv|plain))$/, 
      'Invalid file type. Only images, PDF, JSON, CSV, and text files are allowed')
});

// Subscription validation schema
export const subscriptionSchema = z.object({
  plan: z.enum(['free', 'basic', 'premium', 'enterprise']),
  status: z.enum(['active', 'inactive', 'cancelled', 'expired']),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format').optional(),
  autoRenew: z.boolean().default(false)
});

// Admin action validation schema
export const adminActionSchema = z.object({
  action: z.enum(['create', 'update', 'delete', 'activate', 'deactivate']),
  resource: z.enum(['user', 'test', 'colorResult', 'subscription']),
  resourceId: z.string()
    .min(1, 'Resource ID is required')
    .max(100, 'Resource ID must not exceed 100 characters'),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters')
    .trim()
    .optional()
});

// Search and filter validation schema
export const searchFilterSchema = z.object({
  query: z.string()
    .max(100, 'Search query must not exceed 100 characters')
    .trim()
    .optional(),
  category: z.string()
    .max(50, 'Category must not exceed 50 characters')
    .trim()
    .optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  sortBy: z.enum(['name', 'date', 'category', 'status']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must not exceed 100').default(20)
});

// Export types for TypeScript
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type ChemicalTest = z.infer<typeof chemicalTestSchema>;
export type ColorResult = z.infer<typeof colorResultSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type AdminAction = z.infer<typeof adminActionSchema>;
export type SearchFilter = z.infer<typeof searchFilterSchema>;
