#!/usr/bin/env node

console.log('🔧 Testing Auth Provider Fix');
console.log('🔧 اختبار إصلاح مزود المصادقة');
console.log('='.repeat(50));

const fs = require('fs');
const path = require('path');

// Files that should now use the correct auth provider
const filesToCheck = [
  'src/components/layout/simple-header.tsx',
  'src/components/auth/AuthGuard.tsx',
  'src/components/pages/login-page.tsx',
  'src/components/auth/RootAuthRedirect.tsx',
  'src/components/debug/AuthTestSuite.tsx',
  'src/components/debug/AuthTest.tsx',
  'src/components/subscription/TestAccessGuard.tsx',
  'src/components/pages/test-page.tsx',
  'src/components/layout/header.tsx'
];

// Pages that should not have nested AuthProvider
const pagesToCheck = [
  'src/app/[lang]/auth-test/page.tsx',
  'src/app/[lang]/profile/page.tsx',
  'src/components/pages/tests-page.tsx'
];

console.log('\n🔍 Checking auth provider imports...');

let issuesFound = 0;

filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${filePath} does not exist`);
    issuesFound++;
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it imports from the correct provider
    if (content.includes("from '@/components/providers'")) {
      console.log(`✅ ${filePath} - Uses correct auth provider`);
    } else if (content.includes("from '@/components/auth/")) {
      console.log(`❌ ${filePath} - Still uses Firebase auth provider`);
      issuesFound++;
    } else {
      console.log(`⚠️ ${filePath} - No auth import found`);
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    issuesFound++;
  }
});

console.log('\n🔍 Checking for nested AuthProvider issues...');

pagesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${filePath} does not exist`);
    issuesFound++;
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it has nested AuthProvider
    if (content.includes('<AuthProvider>')) {
      console.log(`❌ ${filePath} - Still has nested AuthProvider`);
      issuesFound++;
    } else {
      console.log(`✅ ${filePath} - No nested AuthProvider`);
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    issuesFound++;
  }
});

console.log('\n📊 Summary:');
if (issuesFound === 0) {
  console.log('✅ All auth provider issues have been fixed!');
  console.log('✅ تم إصلاح جميع مشاكل مزود المصادقة!');
} else {
  console.log(`❌ Found ${issuesFound} issues that need to be addressed`);
  console.log(`❌ تم العثور على ${issuesFound} مشاكل تحتاج إلى معالجة`);
}

console.log('\n🚀 Next steps:');
console.log('🚀 الخطوات التالية:');
console.log('1. Run: npm run build');
console.log('2. Check for any remaining "useAuth must be used within an AuthProvider" errors');
console.log('3. If errors persist, check for other components using wrong auth provider');
