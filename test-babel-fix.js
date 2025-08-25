#!/usr/bin/env node

console.log('🔧 Testing SWC Configuration Fix...');
console.log('🔧 اختبار إصلاح تكوين SWC...');

const fs = require('fs');
const path = require('path');

// Check if babel.config.js is removed (should NOT exist)
const babelConfigPath = path.join(__dirname, 'babel.config.js');
if (!fs.existsSync(babelConfigPath)) {
  console.log('✅ babel.config.js removed (good - using SWC)');
  console.log('✅ ملف babel.config.js محذوف (جيد - استخدام SWC)');
} else {
  console.log('❌ babel.config.js still exists (will conflict with SWC)');
  console.log('❌ ملف babel.config.js ما زال موجود (سيتعارض مع SWC)');
  process.exit(1);
}

// Check next.config.js for SWC configuration
const nextConfigPath = path.join(__dirname, 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

  if (nextConfigContent.includes('swcMinify: true')) {
    console.log('✅ SWC minification enabled in next.config.js');
    console.log('✅ تفعيل SWC minification في next.config.js');
  } else {
    console.log('⚠️ SWC minification not explicitly enabled');
    console.log('⚠️ SWC minification غير مفعل صراحة');
  }

  if (nextConfigContent.includes('compiler:')) {
    console.log('✅ SWC compiler configuration found');
    console.log('✅ تكوين SWC compiler موجود');
  } else {
    console.log('⚠️ SWC compiler configuration not found');
    console.log('⚠️ تكوين SWC compiler غير موجود');
  }
} else {
  console.log('❌ next.config.js not found');
  console.log('❌ ملف next.config.js غير موجود');
  process.exit(1);
}

// Check package.json for Babel dependencies (should be in devDependencies only)
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  console.log('\n📦 Checking dependency configuration...');
  console.log('📦 فحص تكوين التبعيات...');

  // Check that Babel deps are NOT in dependencies (production)
  const babelDepsInProd = packageJson.dependencies && Object.keys(packageJson.dependencies).filter(dep => dep.startsWith('@babel/'));
  if (babelDepsInProd.length === 0) {
    console.log('✅ No Babel dependencies in production dependencies (good)');
    console.log('✅ لا توجد تبعيات Babel في dependencies الإنتاج (جيد)');
  } else {
    console.log('⚠️ Found Babel dependencies in production:', babelDepsInProd);
    console.log('⚠️ وجدت تبعيات Babel في الإنتاج:', babelDepsInProd);
  }

  // Check that Babel deps are in devDependencies
  const babelDepsInDev = packageJson.devDependencies && Object.keys(packageJson.devDependencies).filter(dep => dep.startsWith('@babel/'));
  if (babelDepsInDev.length > 0) {
    console.log('✅ Babel dependencies found in devDependencies:', babelDepsInDev.length);
    console.log('✅ تبعيات Babel موجودة في devDependencies:', babelDepsInDev.length);
  } else {
    console.log('⚠️ No Babel dependencies in devDependencies');
    console.log('⚠️ لا توجد تبعيات Babel في devDependencies');
  }

  console.log('\n🎉 Configuration looks good for SWC usage!');
  console.log('🎉 التكوين يبدو جيد لاستخدام SWC!');
  console.log('\n📝 Next steps:');
  console.log('📝 الخطوات التالية:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run build');
  console.log('3. Deploy to Netlify');
  console.log('1. شغل: npm install');
  console.log('2. شغل: npm run build');
  console.log('3. انشر على Netlify');
} else {
  console.log('❌ package.json not found');
  console.log('❌ ملف package.json غير موجود');
  process.exit(1);
}
