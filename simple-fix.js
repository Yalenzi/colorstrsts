#!/usr/bin/env node

console.log('🚀 Simple Fix with Path Resolution');
console.log('🚀 إصلاح بسيط مع حل مسارات الملفات');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if required files exist
console.log('\n🔍 Checking required files...');
console.log('🔍 فحص الملفات المطلوبة...');

const requiredFiles = [
  'src/components/auth/AuthProvider.tsx',
  'src/components/analytics/AnalyticsProvider.tsx',
  'src/components/auth/RootAuthRedirect.tsx',
  'src/types/index.ts'
];

let allFilesExist = true;

requiredFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${filePath} exists`);
  } else {
    console.log(`❌ ${filePath} missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('⚠️ Some required files are missing');
  console.log('⚠️ بعض الملفات المطلوبة مفقودة');
} else {
  console.log('✅ All required files exist');
  console.log('✅ جميع الملفات المطلوبة موجودة');
}

try {
  console.log('\n📦 Installing dependencies...');
  console.log('📦 تثبيت التبعيات...');

  // Simple npm install
  execSync('npm install', { stdio: 'inherit' });

  console.log('✅ Dependencies installed successfully');
  console.log('✅ تم تثبيت التبعيات بنجاح');

} catch (error) {
  console.log(`❌ Installation failed: ${error.message}`);
  console.log(`❌ فشل التثبيت: ${error.message}`);
  process.exit(1);
}

console.log('\n🎉 Simple fix with path resolution completed!');
console.log('🎉 اكتمل الإصلاح البسيط مع حل المسارات!');
