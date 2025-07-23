import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  sanitizeText, 
  sanitizeEmail, 
  sanitizeHtml, 
  sanitizeArabicText,
  sanitizeUrl,
  sanitizeFileName 
} from '../lib/security/sanitization';
import { 
  userRegistrationSchema, 
  userLoginSchema, 
  chemicalTestSchema,
  fileUploadSchema 
} from '../lib/validation/schemas';
import { validateFileUpload } from '../lib/security/fileValidation';
import { generateCSRFToken, verifyCSRFToken } from '../lib/security/csrf';

describe('Security Tests', () => {
  
  describe('Input Sanitization', () => {
    
    it('should sanitize text input properly', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeText(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('Hello World');
    });

    it('should sanitize HTML content', () => {
      const htmlInput = '<p>Safe content</p><script>alert("xss")</script>';
      const sanitized = sanitizeHtml(htmlInput);
      expect(sanitized).toContain('<p>Safe content</p>');
      expect(sanitized).not.toContain('<script>');
    });

    it('should sanitize email addresses', () => {
      const maliciousEmail = 'test@example.com<script>alert("xss")</script>';
      const sanitized = sanitizeEmail(maliciousEmail);
      expect(sanitized).toBe('test@example.com');
    });

    it('should sanitize Arabic text properly', () => {
      const arabicInput = 'مرحبا بالعالم<script>alert("xss")</script>';
      const sanitized = sanitizeArabicText(arabicInput);
      expect(sanitized).toContain('مرحبا بالعالم');
      expect(sanitized).not.toContain('<script>');
    });

    it('should sanitize URLs', () => {
      const validUrl = 'https://example.com/path';
      const invalidUrl = 'javascript:alert("xss")';
      
      expect(sanitizeUrl(validUrl)).toBe(validUrl);
      expect(sanitizeUrl(invalidUrl)).toBe('');
    });

    it('should sanitize file names', () => {
      const maliciousFileName = '../../../etc/passwd';
      const sanitized = sanitizeFileName(maliciousFileName);
      expect(sanitized).not.toContain('../');
      expect(sanitized).not.toContain('/');
    });

  });

  describe('Input Validation', () => {
    
    it('should validate user registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        displayName: 'Test User',
        language: 'en' as const
      };

      const result = userRegistrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weak passwords', () => {
      const weakPasswordData = {
        email: 'test@example.com',
        password: '123',
        displayName: 'Test User',
        language: 'en' as const
      };

      const result = userRegistrationSchema.safeParse(weakPasswordData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email formats', () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        displayName: 'Test User',
        language: 'en' as const
      };

      const result = userRegistrationSchema.safeParse(invalidEmailData);
      expect(result.success).toBe(false);
    });

    it('should validate chemical test data', () => {
      const validTestData = {
        id: 'test-id',
        method_name: 'Test Method',
        method_name_ar: 'طريقة الاختبار',
        description: 'This is a test description that is long enough',
        description_ar: 'هذا وصف اختبار طويل بما فيه الكفاية',
        category: 'basic',
        safety_level: 'medium' as const,
        preparation_time: 10,
        color_primary: '#FF0000',
        prepare: 'Detailed preparation instructions that are long enough',
        prepare_ar: 'تعليمات التحضير المفصلة التي طويلة بما فيه الكفاية',
        test_type: 'F/L',
        test_number: 'Test 1',
        color_result: 'Red color',
        color_result_ar: 'لون أحمر',
        color_hex: '#FF0000',
        possible_substance: 'Test substance',
        possible_substance_ar: 'مادة الاختبار',
        confidence_level: 'high' as const,
        reference: 'Test reference'
      };

      const result = chemicalTestSchema.safeParse(validTestData);
      expect(result.success).toBe(true);
    });

  });

  describe('File Upload Security', () => {
    
    it('should validate file upload parameters', () => {
      const validFileData = {
        name: 'test-file.jpg',
        size: 1024 * 1024, // 1MB
        type: 'image/jpeg'
      };

      const result = fileUploadSchema.safeParse(validFileData);
      expect(result.success).toBe(true);
    });

    it('should reject files that are too large', () => {
      const largeFileData = {
        name: 'large-file.jpg',
        size: 20 * 1024 * 1024, // 20MB
        type: 'image/jpeg'
      };

      const result = fileUploadSchema.safeParse(largeFileData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid file types', () => {
      const invalidFileData = {
        name: 'malicious.exe',
        size: 1024,
        type: 'application/x-executable'
      };

      const result = fileUploadSchema.safeParse(invalidFileData);
      expect(result.success).toBe(false);
    });

    it('should detect malicious file names', async () => {
      // Mock File object
      const mockFile = {
        name: '../../../etc/passwd',
        size: 1024,
        type: 'text/plain'
      } as File;

      const validation = await validateFileUpload(mockFile);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(expect.stringContaining('path characters'));
    });

  });

  describe('CSRF Protection', () => {
    
    it('should generate valid CSRF tokens', () => {
      const { token, secret } = generateCSRFToken();
      
      expect(token).toBeDefined();
      expect(secret).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
      expect(secret.length).toBeGreaterThan(0);
    });

    it('should verify valid CSRF tokens', () => {
      const { token, secret } = generateCSRFToken();
      const isValid = verifyCSRFToken(token, secret, token);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid CSRF tokens', () => {
      const { token, secret } = generateCSRFToken();
      const invalidToken = 'invalid-token';
      const isValid = verifyCSRFToken(token, secret, invalidToken);
      
      expect(isValid).toBe(false);
    });

  });

  describe('XSS Prevention', () => {
    
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(\'xss\')">',
      '<svg onload="alert(\'xss\')">',
      'javascript:alert("xss")',
      '<iframe src="javascript:alert(\'xss\')"></iframe>',
      '<object data="javascript:alert(\'xss\')"></object>',
      '<embed src="javascript:alert(\'xss\')">',
      '<link rel="stylesheet" href="javascript:alert(\'xss\')">',
      '<style>@import "javascript:alert(\'xss\')"</style>',
      '<meta http-equiv="refresh" content="0;url=javascript:alert(\'xss\')">'
    ];

    xssPayloads.forEach((payload, index) => {
      it(`should prevent XSS attack ${index + 1}`, () => {
        const sanitized = sanitizeHtml(payload);
        expect(sanitized).not.toContain('alert');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
      });
    });

  });

  describe('SQL Injection Prevention', () => {
    
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      "' OR 1=1 --",
      "admin'--",
      "admin'/*",
      "' OR 'x'='x",
      "'; EXEC xp_cmdshell('dir'); --"
    ];

    sqlInjectionPayloads.forEach((payload, index) => {
      it(`should prevent SQL injection attack ${index + 1}`, () => {
        const sanitized = sanitizeText(payload);
        expect(sanitized).not.toContain('DROP');
        expect(sanitized).not.toContain('UNION');
        expect(sanitized).not.toContain('INSERT');
        expect(sanitized).not.toContain('EXEC');
        expect(sanitized).not.toContain('--');
        expect(sanitized).not.toContain('/*');
      });
    });

  });

  describe('Path Traversal Prevention', () => {
    
    const pathTraversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '..%252f..%252f..%252fetc%252fpasswd',
      '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd'
    ];

    pathTraversalPayloads.forEach((payload, index) => {
      it(`should prevent path traversal attack ${index + 1}`, () => {
        const sanitized = sanitizeFileName(payload);
        expect(sanitized).not.toContain('../');
        expect(sanitized).not.toContain('..\\');
        expect(sanitized).not.toContain('%2e%2e');
        expect(sanitized).not.toContain('etc/passwd');
        expect(sanitized).not.toContain('system32');
      });
    });

  });

  describe('Authentication Security', () => {
    
    it('should enforce password complexity', () => {
      const weakPasswords = [
        'password',
        '123456',
        'qwerty',
        'abc123',
        'password123',
        'Password', // Missing number and special char
        'password1', // Missing uppercase and special char
        'PASSWORD1!' // Missing lowercase
      ];

      weakPasswords.forEach(password => {
        const result = userRegistrationSchema.safeParse({
          email: 'test@example.com',
          password,
          displayName: 'Test User',
          language: 'en'
        });
        expect(result.success).toBe(false);
      });
    });

    it('should accept strong passwords', () => {
      const strongPasswords = [
        'SecurePass123!',
        'MyStr0ng@Password',
        'C0mpl3x#P@ssw0rd',
        'Ungu3ss@bl3P@ss'
      ];

      strongPasswords.forEach(password => {
        const result = userRegistrationSchema.safeParse({
          email: 'test@example.com',
          password,
          displayName: 'Test User',
          language: 'en'
        });
        expect(result.success).toBe(true);
      });
    });

  });

  describe('Rate Limiting', () => {
    
    it('should implement rate limiting logic', () => {
      // This would test the rate limiting implementation
      // For now, we'll just verify the structure exists
      expect(typeof require('../lib/security/middleware').createRateLimit).toBe('function');
    });

  });

});

// Performance and load testing
describe('Security Performance Tests', () => {
  
  it('should handle large inputs efficiently', () => {
    const largeInput = 'a'.repeat(10000);
    const start = Date.now();
    const sanitized = sanitizeText(largeInput);
    const end = Date.now();
    
    expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    expect(sanitized.length).toBeLessThanOrEqual(1000); // Should be truncated
  });

  it('should handle multiple concurrent sanitization requests', async () => {
    const inputs = Array(100).fill('<script>alert("xss")</script>test');
    const start = Date.now();
    
    const results = await Promise.all(
      inputs.map(input => Promise.resolve(sanitizeHtml(input)))
    );
    
    const end = Date.now();
    
    expect(end - start).toBeLessThan(1000); // Should complete in under 1 second
    expect(results.every(result => !result.includes('<script>'))).toBe(true);
  });

});
