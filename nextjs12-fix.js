#!/usr/bin/env node

console.log('🚀 Next.js 12 Fix: No react-dom/client needed!');
console.log('🚀 إصلاح Next.js 12: لا حاجة لـ react-dom/client!');

const fs = require('fs');
const { execSync } = require('child_process');

// Step 1: Complete cleanup
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

// Step 2: Install Next.js 12 specifically
console.log('\n📦 Step 2: Installing Next.js 12...');
console.log('📦 الخطوة 2: تثبيت Next.js 12...');

try {
  // Install exact versions
  console.log('📥 Installing Next.js 12.3.4 + React 18.2.0...');
  execSync('npm install --save-exact next@12.3.4 react@18.2.0 react-dom@18.2.0', { stdio: 'inherit' });
  
  console.log('✅ Next.js 12 installed');
  console.log('✅ تم تثبيت Next.js 12');
  
} catch (error) {
  console.log(`❌ Failed to install Next.js 12: ${error.message}`);
  process.exit(1);
}

// Step 3: Install all other dependencies
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

// Step 4: Verify React modules
console.log('\n🔍 Step 4: Verifying React modules...');
console.log('🔍 الخطوة 4: التحقق من مودولات React...');

try {
  require.resolve('react');
  console.log('✅ react is available');
  console.log('✅ react متاح');
} catch (error) {
  console.log('❌ react not found');
  console.log('❌ react غير موجود');
}

try {
  require.resolve('react-dom');
  console.log('✅ react-dom is available');
  console.log('✅ react-dom متاح');
} catch (error) {
  console.log('❌ react-dom not found');
  console.log('❌ react-dom غير موجود');
}

try {
  require.resolve('react/jsx-runtime');
  console.log('✅ react/jsx-runtime is available');
  console.log('✅ react/jsx-runtime متاح');
} catch (error) {
  console.log('⚠️ react/jsx-runtime not found (may not be needed in Next.js 12)');
  console.log('⚠️ react/jsx-runtime غير موجود (قد لا يكون مطلوب في Next.js 12)');
}

// Check if react-dom/client exists (should not be needed in Next.js 12)
try {
  require.resolve('react-dom/client');
  console.log('ℹ️ react-dom/client is available (but not needed in Next.js 12)');
  console.log('ℹ️ react-dom/client متاح (لكن غير مطلوب في Next.js 12)');
} catch (error) {
  console.log('✅ react-dom/client not found (GOOD - Next.js 12 doesn\'t need it)');
  console.log('✅ react-dom/client غير موجود (جيد - Next.js 12 لا يحتاجه)');
}

// Step 5: Final version check
console.log('\n📋 Step 5: Final version check...');
console.log('📋 الخطوة 5: فحص الإصدارات النهائي...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  console.log(`Next.js: ${packageJson.dependencies?.next}`);
  console.log(`React: ${packageJson.dependencies?.react}`);
  console.log(`React-DOM: ${packageJson.dependencies?.['react-dom']}`);
  
  if (packageJson.dependencies?.next === '12.3.4' && 
      packageJson.dependencies?.react === '18.2.0' && 
      packageJson.dependencies?.['react-dom'] === '18.2.0') {
    console.log('✅ All versions are correct for Next.js 12');
    console.log('✅ جميع الإصدارات صحيحة لـ Next.js 12');
  } else {
    console.log('⚠️ Version mismatch detected');
    console.log('⚠️ تم اكتشاف عدم تطابق في الإصدارات');
  }
  
} catch (error) {
  console.log(`❌ Error checking versions: ${error.message}`);
}

console.log('\n🎉 Next.js 12 fix completed!');
console.log('🎉 اكتمل إصلاح Next.js 12!');
console.log('\n💡 Next.js 12.3.4 + React 18.2.0 = No react-dom/client issues!');
console.log('💡 Next.js 12.3.4 + React 18.2.0 = لا مشاكل react-dom/client!');
