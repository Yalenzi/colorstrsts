#!/usr/bin/env node

/**
 * Final Auth Debug Script
 * سكريبت التصحيح النهائي للمصادقة
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Final Auth Debug Script');
console.log('🔧 سكريبت التصحيح النهائي للمصادقة');
console.log('='.repeat(50));

// Check all files that use useAuth
const checkUseAuthFiles = () => {
  console.log('\n🔍 Checking all files that use useAuth...');
  
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
    'src/components/profile/UserProfile.tsx',
    'src/components/dashboard/UserDashboard.tsx',
    'src/components/profile/TestHistory.tsx',
    'src/components/tests/SimpleTestAccessGuard.tsx',
    'src/components/subscription/AccessStatusIndicator.tsx',
    'src/components/auth/EnhancedGoogleSignIn.tsx',
    'src/components/auth/EnhancedLoginForm.tsx',
    'src/hooks/useAuth.ts'
  ];

  let issuesFound = 0;

  filesToCheck.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ ${filePath} does not exist`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if it uses useAuth
      if (content.includes('useAuth')) {
        // Check import source
        if (content.includes("from '@/components/providers'")) {
          console.log(`✅ ${filePath} - Uses correct auth provider`);
        } else if (content.includes("from '@/components/auth/")) {
          console.log(`❌ ${filePath} - Uses wrong auth provider`);
          issuesFound++;
        } else if (content.includes('useAuth')) {
          console.log(`⚠️ ${filePath} - Uses useAuth but import unclear`);
        }
      } else {
        console.log(`ℹ️ ${filePath} - No useAuth usage`);
      }
    } catch (error) {
      console.log(`❌ Error reading ${filePath}: ${error.message}`);
      issuesFound++;
    }
  });

  return issuesFound;
};

// Check provider structure
const checkProviderStructure = () => {
  console.log('\n🔍 Checking provider structure...');
  
  const layoutFiles = [
    'src/app/layout.tsx',
    'src/app/[lang]/layout.tsx',
    'src/components/providers.tsx'
  ];

  layoutFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${filePath} does not exist`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`\n📁 ${filePath}:`);
      
      if (content.includes('<Providers>')) {
        console.log('  ✅ Uses Providers component');
      }
      if (content.includes('<AuthProvider>')) {
        console.log('  ✅ Contains AuthProvider');
      }
      if (content.includes('<ThemeProvider>')) {
        console.log('  ✅ Contains ThemeProvider');
      }
      if (content.includes('<AnalyticsProvider>')) {
        console.log('  ✅ Contains AnalyticsProvider');
      }
    } catch (error) {
      console.log(`❌ Error reading ${filePath}: ${error.message}`);
    }
  });
};

// Check for potential SSR issues
const checkSSRIssues = () => {
  console.log('\n🔍 Checking for potential SSR issues...');
  
  const ssrSensitiveFiles = [
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'src/app/[lang]/layout.tsx'
  ];

  ssrSensitiveFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${filePath} does not exist`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('useAuth') && !content.includes("'use client'")) {
        console.log(`⚠️ ${filePath} - Uses useAuth without 'use client'`);
      } else if (content.includes('useAuth')) {
        console.log(`✅ ${filePath} - Uses useAuth with 'use client'`);
      } else {
        console.log(`ℹ️ ${filePath} - No useAuth usage`);
      }
    } catch (error) {
      console.log(`❌ Error reading ${filePath}: ${error.message}`);
    }
  });
};

// Main execution
const main = () => {
  const authIssues = checkUseAuthFiles();
  checkProviderStructure();
  checkSSRIssues();

  console.log('\n📊 Summary:');
  if (authIssues === 0) {
    console.log('🎉 All auth provider issues appear to be fixed!');
    console.log('🎉 يبدو أن جميع مشاكل مزود المصادقة قد تم إصلاحها!');
  } else {
    console.log(`❌ Found ${authIssues} auth provider issues`);
    console.log(`❌ تم العثور على ${authIssues} مشاكل في مزود المصادقة`);
  }

  console.log('\n🚀 Next steps if issues persist:');
  console.log('1. Check build logs for specific error locations');
  console.log('2. Ensure all components using useAuth are client components');
  console.log('3. Verify AuthProvider is available in all contexts');
  console.log('4. Check for dynamic imports or lazy loading issues');
};

main();
