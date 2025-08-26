#!/usr/bin/env node

/**
 * Netlify Build Diagnosis Script
 * سكريبت تشخيص بناء Netlify
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Netlify Build Diagnosis Script');
console.log('🔍 سكريبت تشخيص بناء Netlify');
console.log('='.repeat(60));

// Check critical files
const checkCriticalFiles = () => {
  console.log('\n📁 Checking critical files...');
  
  const criticalFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/app/[lang]/layout.tsx',
    'src/components/providers.tsx',
    'netlify.toml'
  ];

  let missingFiles = [];

  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      missingFiles.push(file);
    }
  });

  return missingFiles;
};

// Check for useAuth imports
const checkUseAuthImports = () => {
  console.log('\n🔍 Checking useAuth imports...');
  
  const filesToCheck = [
    'src/components/auth/AuthGuard.tsx',
    'src/components/pages/login-page.tsx',
    'src/components/auth/RootAuthRedirect.tsx',
    'src/components/dashboard/UserDashboard.tsx',
    'src/components/profile/TestHistory.tsx',
    'src/components/tests/SimpleTestAccessGuard.tsx',
    'src/components/subscription/AccessStatusIndicator.tsx',
    'src/components/auth/EnhancedGoogleSignIn.tsx',
    'src/components/auth/EnhancedLoginForm.tsx',
    'src/hooks/useAuth.ts'
  ];

  let wrongImports = [];

  filesToCheck.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ ${filePath} - File not found`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('useAuth')) {
        if (content.includes("from '@/components/providers'")) {
          console.log(`✅ ${filePath} - Correct import`);
        } else if (content.includes("from '@/components/auth/")) {
          console.log(`❌ ${filePath} - Wrong import`);
          wrongImports.push(filePath);
        } else {
          console.log(`⚠️ ${filePath} - useAuth found but import unclear`);
        }
      } else {
        console.log(`ℹ️ ${filePath} - No useAuth usage`);
      }
    } catch (error) {
      console.log(`❌ Error reading ${filePath}: ${error.message}`);
    }
  });

  return wrongImports;
};

// Check for default exports
const checkDefaultExports = () => {
  console.log('\n📄 Checking default exports...');
  
  const pageFiles = [
    'src/components/pages/home-page.tsx',
    'src/components/pages/login-page.tsx',
    'src/components/pages/admin-page.tsx',
    'src/components/pages/contact-page.tsx',
    'src/components/pages/tests-page.tsx',
    'src/components/pages/test-page.tsx',
    'src/components/pages/results-page.tsx',
    'src/components/pages/history-page.tsx',
    'src/components/pages/image-analyzer-page.tsx',
    'src/components/pages/register-page.tsx',
    'src/components/pages/result-detail-page.tsx',
    'src/components/pages/enhanced-image-analyzer-page.tsx'
  ];

  let missingExports = [];

  pageFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ ${filePath} - File not found`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('export default')) {
        console.log(`✅ ${filePath} - Has default export`);
      } else {
        console.log(`❌ ${filePath} - Missing default export`);
        missingExports.push(filePath);
      }
    } catch (error) {
      console.log(`❌ Error reading ${filePath}: ${error.message}`);
    }
  });

  return missingExports;
};

// Check providers structure
const checkProvidersStructure = () => {
  console.log('\n🔧 Checking providers structure...');
  
  const providersFile = 'src/components/providers.tsx';
  
  if (!fs.existsSync(providersFile)) {
    console.log(`❌ ${providersFile} - File not found`);
    return false;
  }

  try {
    const content = fs.readFileSync(providersFile, 'utf8');
    
    const checks = [
      { name: 'AuthProvider function', pattern: 'function AuthProvider' },
      { name: 'useAuth export', pattern: 'export function useAuth' },
      { name: 'AuthContext creation', pattern: 'createContext<AuthContextType' },
      { name: 'Main Providers export', pattern: 'export function Providers' },
      { name: 'signIn function', pattern: 'signIn:' },
      { name: 'signUp function', pattern: 'signUp:' },
      { name: 'signOut function', pattern: 'signOut:' },
      { name: 'signInWithGoogle function', pattern: 'signInWithGoogle:' }
    ];

    checks.forEach(check => {
      if (content.includes(check.pattern)) {
        console.log(`✅ ${check.name}`);
      } else {
        console.log(`❌ ${check.name} - Missing`);
      }
    });

    return true;
  } catch (error) {
    console.log(`❌ Error reading ${providersFile}: ${error.message}`);
    return false;
  }
};

// Check for potential build issues
const checkBuildIssues = () => {
  console.log('\n⚠️ Checking for potential build issues...');
  
  // Check for TypeScript errors
  const tsConfigFile = 'tsconfig.json';
  if (fs.existsSync(tsConfigFile)) {
    console.log(`✅ TypeScript config exists`);
  } else {
    console.log(`❌ TypeScript config missing`);
  }

  // Check for Next.js config
  const nextConfigFile = 'next.config.js';
  if (fs.existsSync(nextConfigFile)) {
    console.log(`✅ Next.js config exists`);
    
    try {
      const content = fs.readFileSync(nextConfigFile, 'utf8');
      if (content.includes('output:') && content.includes('export')) {
        console.log(`✅ Static export configuration found`);
      } else {
        console.log(`⚠️ Static export configuration may be missing`);
      }
    } catch (error) {
      console.log(`❌ Error reading Next.js config: ${error.message}`);
    }
  } else {
    console.log(`❌ Next.js config missing`);
  }

  // Check package.json scripts
  const packageFile = 'package.json';
  if (fs.existsSync(packageFile)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts.build) {
        console.log(`✅ Build script exists: ${packageJson.scripts.build}`);
      } else {
        console.log(`❌ Build script missing`);
      }
    } catch (error) {
      console.log(`❌ Error reading package.json: ${error.message}`);
    }
  }
};

// Main execution
const main = () => {
  const missingFiles = checkCriticalFiles();
  const wrongImports = checkUseAuthImports();
  const missingExports = checkDefaultExports();
  const providersOk = checkProvidersStructure();
  checkBuildIssues();

  console.log('\n📊 DIAGNOSIS SUMMARY:');
  console.log('📊 ملخص التشخيص:');
  console.log('='.repeat(40));

  if (missingFiles.length === 0 && wrongImports.length === 0 && missingExports.length === 0 && providersOk) {
    console.log('🎉 All checks passed! Build should succeed.');
    console.log('🎉 جميع الفحوصات نجحت! يجب أن ينجح البناء.');
  } else {
    console.log('❌ Issues found:');
    console.log('❌ تم العثور على مشاكل:');
    
    if (missingFiles.length > 0) {
      console.log(`  - ${missingFiles.length} missing critical files`);
    }
    if (wrongImports.length > 0) {
      console.log(`  - ${wrongImports.length} files with wrong useAuth imports`);
    }
    if (missingExports.length > 0) {
      console.log(`  - ${missingExports.length} page files missing default exports`);
    }
    if (!providersOk) {
      console.log(`  - Providers structure issues`);
    }
  }

  console.log('\n🚀 Next steps:');
  console.log('1. Fix any issues listed above');
  console.log('2. Ensure all files are uploaded to your repository');
  console.log('3. Try building again');
  console.log('4. Check Netlify build logs for specific error messages');
};

main();
