#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 إصلاح أخطاء React - Fixing React Errors');
console.log('=====================================');

// Files that need useAuth import fix
const filesToFix = [
  'src/components/admin/TestManagement.tsx',
  'src/components/profile/UserProfile.tsx',
  'src/app/[lang]/debug/profile-test/page.tsx',
  'src/app/[lang]/profile/page.tsx',
  'src/app/[lang]/admin/tests/page.tsx',
  'src/app/[lang]/admin/page.tsx',
  'src/components/auth/AuthGuard.tsx',
  'src/components/dashboard/UserDashboard.tsx',
  'src/components/profile/TestHistory.tsx',
  'src/components/tests/SimpleTestAccessGuard.tsx',
  'src/components/subscription/AccessStatusIndicator.tsx',
  'src/components/auth/EnhancedGoogleSignIn.tsx',
  'src/components/auth/EnhancedLoginForm.tsx',
];

// Function to fix useAuth imports
const fixUseAuthImports = () => {
  console.log('\n🔄 إصلاح استيرادات useAuth...');
  
  let fixedCount = 0;
  
  filesToFix.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ ${filePath} - الملف غير موجود`);
      return;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Fix various useAuth import patterns
      const patterns = [
        {
          from: /import\s*{\s*useAuth\s*}\s*from\s*['"]@\/components\/auth\/AuthProvider['"];?/g,
          to: "import { useAuth } from '@/components/providers';"
        },
        {
          from: /import\s*{\s*useAuth\s*}\s*from\s*['"]@\/components\/auth\/EnhancedAuthProvider['"];?/g,
          to: "import { useAuth } from '@/components/providers';"
        },
        {
          from: /import\s*{\s*useAuth\s*}\s*from\s*['"]@\/components\/safe-providers['"];?/g,
          to: "import { useAuth } from '@/components/providers';"
        },
        {
          from: /import\s*{\s*useAuth\s*}\s*from\s*['"]@\/hooks\/useAuth['"];?/g,
          to: "import { useAuth } from '@/components/providers';"
        }
      ];

      patterns.forEach(pattern => {
        if (pattern.from.test(content)) {
          content = content.replace(pattern.from, pattern.to);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${filePath} - تم إصلاح الاستيراد`);
        fixedCount++;
      } else {
        console.log(`ℹ️ ${filePath} - لا يحتاج إصلاح`);
      }

    } catch (error) {
      console.log(`❌ خطأ في ${filePath}: ${error.message}`);
    }
  });

  console.log(`\n📊 تم إصلاح ${fixedCount} ملف`);
  return fixedCount;
};

// Function to ensure all page components have 'use client'
const ensureUseClient = () => {
  console.log('\n🔄 التأكد من وجود "use client"...');
  
  const pageFiles = [
    'src/app/[lang]/page.tsx',
    'src/app/[lang]/tests/page.tsx',
    'src/app/[lang]/profile/page.tsx',
    'src/app/[lang]/admin/page.tsx',
    'src/app/[lang]/admin/tests/page.tsx',
    'src/app/[lang]/debug/system-test/page.tsx',
    'src/app/[lang]/debug/profile-test/page.tsx',
  ];

  let fixedCount = 0;

  pageFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ ${filePath} - الملف غير موجود`);
      return;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (!content.includes("'use client'") && !content.includes('"use client"')) {
        content = "'use client';\n\n" + content;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${filePath} - تم إضافة 'use client'`);
        fixedCount++;
      } else {
        console.log(`ℹ️ ${filePath} - يحتوي على 'use client' بالفعل`);
      }

    } catch (error) {
      console.log(`❌ خطأ في ${filePath}: ${error.message}`);
    }
  });

  console.log(`\n📊 تم إصلاح ${fixedCount} ملف`);
  return fixedCount;
};

// Function to check for hydration issues
const checkHydrationIssues = () => {
  console.log('\n🔄 فحص مشاكل الـ hydration...');
  
  const componentsToCheck = [
    'src/components/layout/header.tsx',
    'src/components/admin/TestManagement.tsx',
    'src/components/profile/UserProfile.tsx',
  ];

  componentsToCheck.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ ${filePath} - الملف غير موجود`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for potential hydration issues
      const issues = [];
      
      if (content.includes('localStorage') && !content.includes('useEffect')) {
        issues.push('استخدام localStorage بدون useEffect');
      }
      
      if (content.includes('window') && !content.includes('typeof window')) {
        issues.push('استخدام window بدون فحص typeof window');
      }
      
      if (content.includes('document') && !content.includes('typeof document')) {
        issues.push('استخدام document بدون فحص typeof document');
      }

      if (issues.length > 0) {
        console.log(`⚠️ ${filePath} - مشاكل محتملة:`);
        issues.forEach(issue => console.log(`   - ${issue}`));
      } else {
        console.log(`✅ ${filePath} - لا توجد مشاكل hydration واضحة`);
      }

    } catch (error) {
      console.log(`❌ خطأ في ${filePath}: ${error.message}`);
    }
  });
};

// Function to create a comprehensive test page
const createTestPage = () => {
  console.log('\n🔄 إنشاء صفحة اختبار شاملة...');
  
  const testPageContent = `'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers';

export default function ReactErrorTestPage() {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">React Error Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Auth Status</h2>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>User: {user ? user.email : 'Not logged in'}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Hydration Test</h2>
          <p>Mounted: {mounted ? 'Yes' : 'No'}</p>
          <p>Window available: {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Console Check</h2>
          <p>Check browser console for React errors</p>
          <button 
            onClick={() => console.log('Test button clicked')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Test Console
          </button>
        </div>
      </div>
    </div>
  );
}`;

  const testPagePath = 'src/app/[lang]/debug/react-test/page.tsx';
  const testPageDir = path.dirname(testPagePath);
  
  if (!fs.existsSync(testPageDir)) {
    fs.mkdirSync(testPageDir, { recursive: true });
  }
  
  fs.writeFileSync(testPagePath, testPageContent, 'utf8');
  console.log(`✅ تم إنشاء صفحة الاختبار: ${testPagePath}`);
};

// Main execution
const main = () => {
  console.log('🚀 بدء عملية الإصلاح...\n');
  
  const results = {
    useAuthFixes: fixUseAuthImports(),
    useClientFixes: ensureUseClient(),
  };
  
  checkHydrationIssues();
  createTestPage();
  
  console.log('\n🎉 تم الانتهاء من الإصلاح!');
  console.log('=====================================');
  console.log(`📊 النتائج:`);
  console.log(`   - إصلاح استيرادات useAuth: ${results.useAuthFixes} ملف`);
  console.log(`   - إضافة 'use client': ${results.useClientFixes} ملف`);
  console.log('\n🔗 صفحات الاختبار:');
  console.log('   - http://localhost:3000/ar/debug/react-test');
  console.log('   - http://localhost:3000/ar/debug/system-test');
  console.log('\n💡 نصائح:');
  console.log('   1. تحقق من الكونسول للأخطاء');
  console.log('   2. اختبر الصفحات في المتصفح');
  console.log('   3. تأكد من عمل المصادقة');
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  fixUseAuthImports,
  ensureUseClient,
  checkHydrationIssues,
  createTestPage
};
