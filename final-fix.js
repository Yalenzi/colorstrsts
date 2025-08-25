#!/usr/bin/env node

console.log('🚀 Final Fix: Next.js 13 + React 18.2 Stable Setup');
console.log('🚀 الإصلاح النهائي: إعداد مستقر Next.js 13 + React 18.2');

const fs = require('fs');
const { execSync } = require('child_process');

// Step 1: Clean everything
console.log('\n🧹 Step 1: Complete cleanup...');
console.log('🧹 الخطوة 1: تنظيف شامل...');

try {
  // Remove node_modules
  if (fs.existsSync('node_modules')) {
    console.log('🗑️ Removing node_modules...');
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  
  // Remove package-lock.json
  if (fs.existsSync('package-lock.json')) {
    console.log('🗑️ Removing package-lock.json...');
    fs.unlinkSync('package-lock.json');
  }
  
  // Remove .next cache
  if (fs.existsSync('.next')) {
    console.log('🗑️ Removing .next cache...');
    execSync('rm -rf .next', { stdio: 'inherit' });
  }
  
  console.log('✅ Cleanup completed');
  console.log('✅ اكتمل التنظيف');
  
} catch (error) {
  console.log(`⚠️ Cleanup warning: ${error.message}`);
}

// Step 2: Install specific versions
console.log('\n📦 Step 2: Installing stable versions...');
console.log('📦 الخطوة 2: تثبيت الإصدارات المستقرة...');

try {
  // Install Next.js 13 + React 18.2
  console.log('📥 Installing Next.js 13.5.6 + React 18.2.0...');
  execSync('npm install next@13.5.6 react@18.2.0 react-dom@18.2.0', { stdio: 'inherit' });
  
  console.log('✅ Core packages installed');
  console.log('✅ تم تثبيت الحزم الأساسية');
  
} catch (error) {
  console.log(`❌ Failed to install core packages: ${error.message}`);
  process.exit(1);
}

// Step 3: Install all dependencies
console.log('\n📦 Step 3: Installing all dependencies...');
console.log('📦 الخطوة 3: تثبيت جميع التبعيات...');

try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ All dependencies installed');
  console.log('✅ تم تثبيت جميع التبعيات');
  
} catch (error) {
  console.log(`❌ Failed to install dependencies: ${error.message}`);
  process.exit(1);
}

// Step 4: Verify jsx-runtime
console.log('\n🔍 Step 4: Verifying jsx-runtime...');
console.log('🔍 الخطوة 4: التحقق من jsx-runtime...');

try {
  require.resolve('react/jsx-runtime');
  console.log('✅ react/jsx-runtime is available');
  console.log('✅ react/jsx-runtime متاح');
} catch (error) {
  console.log('❌ react/jsx-runtime not found');
  console.log('❌ react/jsx-runtime غير موجود');
}

try {
  require.resolve('react-dom/client');
  console.log('✅ react-dom/client is available');
  console.log('✅ react-dom/client متاح');
} catch (error) {
  console.log('⚠️ react-dom/client not found (may not be needed in Next.js 13)');
  console.log('⚠️ react-dom/client غير موجود (قد لا يكون مطلوب في Next.js 13)');
}

// Step 5: Check versions
console.log('\n📋 Step 5: Final version check...');
console.log('📋 الخطوة 5: فحص الإصدارات النهائي...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  console.log(`Next.js: ${packageJson.dependencies?.next}`);
  console.log(`React: ${packageJson.dependencies?.react}`);
  console.log(`React-DOM: ${packageJson.dependencies?.['react-dom']}`);
  
  if (packageJson.dependencies?.next === '13.5.6' && 
      packageJson.dependencies?.react === '18.2.0' && 
      packageJson.dependencies?.['react-dom'] === '18.2.0') {
    console.log('✅ All versions are correct and stable');
    console.log('✅ جميع الإصدارات صحيحة ومستقرة');
  } else {
    console.log('⚠️ Version mismatch detected');
    console.log('⚠️ تم اكتشاف عدم تطابق في الإصدارات');
  }
  
} catch (error) {
  console.log(`❌ Error checking versions: ${error.message}`);
}

console.log('\n🎉 Final fix completed!');
console.log('🎉 اكتمل الإصلاح النهائي!');
console.log('\n💡 Next.js 13.5.6 + React 18.2.0 = Maximum Stability');
console.log('💡 Next.js 13.5.6 + React 18.2.0 = أقصى استقرار');
