#!/usr/bin/env node

console.log('🔧 Testing SWC Configuration Fix...');
console.log('🔧 اختبار إصلاح تكوين SWC...');

const fs = require('fs');
const path = require('path');

// Check if babel.config.js exists with correct content
const babelConfigPath = path.join(__dirname, 'babel.config.js');
if (fs.existsSync(babelConfigPath)) {
  const babelConfig = fs.readFileSync(babelConfigPath, 'utf8');
  if (babelConfig.includes('next/babel')) {
    console.log('✅ babel.config.js exists with next/babel preset');
    console.log('✅ ملف babel.config.js موجود مع next/babel preset');
  } else {
    console.log('⚠️ babel.config.js exists but may have wrong configuration');
    console.log('⚠️ ملف babel.config.js موجود لكن قد يحتوي تكوين خاطئ');
  }
} else {
  console.log('❌ babel.config.js missing');
  console.log('❌ ملف babel.config.js مفقود');
  process.exit(1);
}

// Check next.config.js for proper configuration
const nextConfigPath = path.join(__dirname, 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

  if (nextConfigContent.includes('swcMinify: true')) {
    console.log('⚠️ swcMinify found (not supported in Next.js 15)');
    console.log('⚠️ swcMinify موجود (غير مدعوم في Next.js 15)');
  } else {
    console.log('✅ No swcMinify configuration (good for Next.js 15)');
    console.log('✅ لا يوجد تكوين swcMinify (جيد لـ Next.js 15)');
  }

  if (nextConfigContent.includes('SWC is enabled by default')) {
    console.log('✅ Proper SWC comment found');
    console.log('✅ تعليق SWC الصحيح موجود');
  } else {
    console.log('ℹ️ SWC comment not found (optional)');
    console.log('ℹ️ تعليق SWC غير موجود (اختياري)');
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

  // Check that @babel/plugin-transform-runtime is in dependencies (required for build)
  const transformRuntimeInProd = packageJson.dependencies && packageJson.dependencies['@babel/plugin-transform-runtime'];
  if (transformRuntimeInProd) {
    console.log('✅ @babel/plugin-transform-runtime in dependencies (required)');
    console.log('✅ @babel/plugin-transform-runtime في dependencies (مطلوب)');
  } else {
    console.log('❌ @babel/plugin-transform-runtime missing from dependencies');
    console.log('❌ @babel/plugin-transform-runtime مفقود من dependencies');
  }

  // Check other Babel deps are in devDependencies
  const otherBabelDepsInProd = packageJson.dependencies && Object.keys(packageJson.dependencies).filter(dep => dep.startsWith('@babel/') && dep !== '@babel/plugin-transform-runtime');
  if (otherBabelDepsInProd.length === 0) {
    console.log('✅ Other Babel dependencies not in production (good)');
    console.log('✅ باقي تبعيات Babel ليست في الإنتاج (جيد)');
  } else {
    console.log('⚠️ Found other Babel dependencies in production:', otherBabelDepsInProd);
    console.log('⚠️ وجدت تبعيات Babel أخرى في الإنتاج:', otherBabelDepsInProd);
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

  console.log('\n🎉 Configuration looks good for Next.js with minimal Babel!');
  console.log('🎉 التكوين يبدو جيد لـ Next.js مع Babel بسيط!');
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
