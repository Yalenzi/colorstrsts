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

  // Install immer specifically (required by Next.js)
  console.log('📥 Installing immer (required by Next.js)...');
  console.log('📥 تثبيت immer (مطلوب لـ Next.js)...');
  execSync('npm install immer@^10.0.3', { stdio: 'inherit' });

  // Install all dependencies
  execSync('npm install', { stdio: 'inherit' });

  console.log('✅ Dependencies installed successfully');
  console.log('✅ تم تثبيت التبعيات بنجاح');

} catch (error) {
  console.log(`❌ Installation failed: ${error.message}`);
  console.log(`❌ فشل التثبيت: ${error.message}`);
  process.exit(1);
}

// Check for force-dynamic conflicts with static export
console.log('\n🔍 Checking for force-dynamic conflicts...');
console.log('🔍 فحص تعارضات force-dynamic...');

const fs = require('fs');
const path = require('path');

function checkForForceDynamic(dir) {
  const conflicts = [];

  function searchRecursive(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          searchRecursive(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes("dynamic = 'force-dynamic'")) {
              conflicts.push(fullPath);
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }

  if (fs.existsSync(dir)) {
    searchRecursive(dir);
  }
  return conflicts;
}

const conflicts = checkForForceDynamic('src/app');

if (conflicts.length === 0) {
  console.log('✅ No force-dynamic conflicts found');
  console.log('✅ لم يتم العثور على تعارضات force-dynamic');
} else {
  console.log(`⚠️ Found ${conflicts.length} force-dynamic conflicts:`);
  console.log(`⚠️ تم العثور على ${conflicts.length} تعارضات force-dynamic:`);
  conflicts.forEach(file => {
    console.log(`   - ${file}`);
  });
  console.log('💡 These files need to be fixed for static export');
  console.log('💡 هذه الملفات تحتاج إصلاح للتصدير الثابت');
}

console.log('\n🎉 Simple fix with path resolution and static export check completed!');
console.log('🎉 اكتمل الإصلاح البسيط مع حل المسارات وفحص التصدير الثابت!');
