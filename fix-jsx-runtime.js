#!/usr/bin/env node

console.log('🔧 Comprehensive JSX Runtime Fix...');
console.log('🔧 إصلاح شامل لـ JSX Runtime...');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if react/jsx-runtime is available
console.log('\n🔍 Checking React JSX Runtime...');
console.log('🔍 فحص React JSX Runtime...');

try {
  // Try to resolve react/jsx-runtime
  const reactJsxRuntime = require.resolve('react/jsx-runtime');
  console.log(`✅ react/jsx-runtime found at: ${reactJsxRuntime}`);
  console.log(`✅ تم العثور على react/jsx-runtime في: ${reactJsxRuntime}`);
} catch (error) {
  console.log('❌ react/jsx-runtime not found');
  console.log('❌ لم يتم العثور على react/jsx-runtime');
  console.log(`Error: ${error.message}`);
}

// Check React version
console.log('\n📦 Checking React Version...');
console.log('📦 فحص إصدار React...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const reactVersion = packageJson.dependencies?.react || packageJson.devDependencies?.react;
  const reactDomVersion = packageJson.dependencies?.['react-dom'] || packageJson.devDependencies?.['react-dom'];
  
  console.log(`React version: ${reactVersion || 'not found'}`);
  console.log(`React-DOM version: ${reactDomVersion || 'not found'}`);
  
  if (reactVersion && reactVersion.includes('18')) {
    console.log('✅ React 18 detected - jsx-runtime should be available');
    console.log('✅ تم اكتشاف React 18 - jsx-runtime يجب أن يكون متاح');
  } else {
    console.log('⚠️ React version may not support jsx-runtime');
    console.log('⚠️ إصدار React قد لا يدعم jsx-runtime');
  }
} catch (error) {
  console.log(`❌ Error reading package.json: ${error.message}`);
}

// Check tsconfig.json JSX setting
console.log('\n⚙️ Checking TypeScript JSX Configuration...');
console.log('⚙️ فحص تكوين TypeScript JSX...');

try {
  if (fs.existsSync('tsconfig.json')) {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    const jsxSetting = tsconfig.compilerOptions?.jsx;
    
    console.log(`JSX setting: ${jsxSetting || 'not set'}`);
    
    if (jsxSetting === 'react-jsx') {
      console.log('✅ JSX setting is correct for React 18');
      console.log('✅ إعداد JSX صحيح لـ React 18');
    } else if (jsxSetting === 'preserve') {
      console.log('⚠️ JSX setting is "preserve" - may cause jsx-runtime issues');
      console.log('⚠️ إعداد JSX هو "preserve" - قد يسبب مشاكل jsx-runtime');
    } else {
      console.log('⚠️ JSX setting may not be optimal for React 18');
      console.log('⚠️ إعداد JSX قد لا يكون مثالي لـ React 18');
    }
  } else {
    console.log('❌ tsconfig.json not found');
    console.log('❌ tsconfig.json غير موجود');
  }
} catch (error) {
  console.log(`❌ Error reading tsconfig.json: ${error.message}`);
}

// Check Next.js version compatibility
console.log('\n🚀 Checking Next.js Compatibility...');
console.log('🚀 فحص توافق Next.js...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next;
  
  console.log(`Next.js version: ${nextVersion || 'not found'}`);
  
  if (nextVersion && (nextVersion.includes('15') || nextVersion.includes('14'))) {
    console.log('✅ Next.js version supports React 18 jsx-runtime');
    console.log('✅ إصدار Next.js يدعم React 18 jsx-runtime');
  } else {
    console.log('⚠️ Next.js version may have jsx-runtime compatibility issues');
    console.log('⚠️ إصدار Next.js قد يواجه مشاكل توافق jsx-runtime');
  }
} catch (error) {
  console.log(`❌ Error checking Next.js version: ${error.message}`);
}

// Check node_modules structure
console.log('\n📁 Checking Node Modules Structure...');
console.log('📁 فحص بنية Node Modules...');

const checkPaths = [
  'node_modules/react',
  'node_modules/react-dom',
  'node_modules/react/jsx-runtime.js',
  'node_modules/react/jsx-dev-runtime.js'
];

checkPaths.forEach(checkPath => {
  if (fs.existsSync(checkPath)) {
    console.log(`✅ ${checkPath} exists`);
  } else {
    console.log(`❌ ${checkPath} missing`);
  }
});

console.log('\n💡 Recommendations:');
console.log('💡 التوصيات:');

console.log('1. Ensure React 18+ is installed');
console.log('2. Set "jsx": "react-jsx" in tsconfig.json');
console.log('3. Clear node_modules and reinstall if needed');
console.log('4. Use Next.js 14+ for best React 18 support');

console.log('1. تأكد من تثبيت React 18+');
console.log('2. اضبط "jsx": "react-jsx" في tsconfig.json');
console.log('3. امسح node_modules وأعد التثبيت إذا لزم الأمر');
console.log('4. استخدم Next.js 14+ لأفضل دعم لـ React 18');

// Force clean install if jsx-runtime issues persist
console.log('\n🧹 Cleaning node_modules for fresh install...');
console.log('🧹 تنظيف node_modules للتثبيت الجديد...');

try {
  if (fs.existsSync('node_modules')) {
    console.log('🗑️ Removing node_modules...');
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }

  if (fs.existsSync('package-lock.json')) {
    console.log('🗑️ Removing package-lock.json...');
    fs.unlinkSync('package-lock.json');
  }

  console.log('📦 Installing fresh dependencies...');
  console.log('📦 تثبيت تبعيات جديدة...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('✅ Fresh install completed');
  console.log('✅ اكتمل التثبيت الجديد');
} catch (error) {
  console.log(`⚠️ Clean install failed: ${error.message}`);
  console.log(`⚠️ فشل التثبيت النظيف: ${error.message}`);
}

console.log('\n🔧 Comprehensive JSX Runtime fix completed!');
console.log('🔧 اكتمل الإصلاح الشامل لـ JSX Runtime!');
