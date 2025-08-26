#!/usr/bin/env node

const fs = require('fs');

console.log('🔍 Verifying Auth Provider Fix');
console.log('🔍 التحقق من إصلاح مزود المصادقة');
console.log('='.repeat(50));

// Files that should use the correct auth provider
const filesToCheck = [
  'src/components/layout/simple-header.tsx',
  'src/components/auth/AuthGuard.tsx',
  'src/components/pages/login-page.tsx',
  'src/components/auth/RootAuthRedirect.tsx',
  'src/components/debug/AuthTestSuite.tsx',
  'src/components/debug/AuthTest.tsx',
  'src/components/subscription/TestAccessGuard.tsx',
  'src/components/pages/test-page.tsx',
  'src/components/layout/header.tsx',
  'src/components/payment/STCPayComponent.tsx',
  'src/components/subscription/SubscriptionModal.tsx',
  'src/components/debug/FirebaseDebug.tsx',
  'src/components/profile/UserProfile.tsx'
];

// Pages that should not have nested AuthProvider
const pagesToCheck = [
  'src/app/[lang]/auth-test/page.tsx',
  'src/app/[lang]/profile/page.tsx',
  'src/components/pages/tests-page.tsx'
];

let issuesFound = 0;

console.log('\n✅ Checking auth provider imports...');

filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${filePath} does not exist`);
    issuesFound++;
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes("from '@/components/providers'")) {
      console.log(`✅ ${filePath}`);
    } else if (content.includes("from '@/components/auth/")) {
      console.log(`❌ ${filePath} - Still uses wrong auth provider`);
      issuesFound++;
    } else if (content.includes('useAuth')) {
      console.log(`⚠️ ${filePath} - Uses useAuth but no import found`);
    } else {
      console.log(`ℹ️ ${filePath} - No auth usage`);
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    issuesFound++;
  }
});

console.log('\n✅ Checking for nested AuthProvider...');

pagesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${filePath} does not exist`);
    issuesFound++;
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('<AuthProvider>')) {
      console.log(`❌ ${filePath} - Still has nested AuthProvider`);
      issuesFound++;
    } else {
      console.log(`✅ ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    issuesFound++;
  }
});

console.log('\n📊 Summary:');
if (issuesFound === 0) {
  console.log('🎉 All auth provider issues have been fixed!');
  console.log('🎉 تم إصلاح جميع مشاكل مزود المصادقة!');
  console.log('\n🚀 Ready to build!');
  console.log('🚀 جاهز للبناء!');
} else {
  console.log(`❌ Found ${issuesFound} issues that need to be addressed`);
  console.log(`❌ تم العثور على ${issuesFound} مشاكل تحتاج إلى معالجة`);
}

// Write result to file for easy checking
fs.writeFileSync('auth-fix-result.txt', `Auth Fix Status: ${issuesFound === 0 ? 'SUCCESS' : 'FAILED'}\nIssues Found: ${issuesFound}\nTimestamp: ${new Date().toISOString()}`);

process.exit(issuesFound === 0 ? 0 : 1);
