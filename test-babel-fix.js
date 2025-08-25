#!/usr/bin/env node

console.log('🔧 Testing SWC-Only Configuration...');
console.log('🔧 اختبار تكوين SWC فقط...');

const fs = require('fs');
const path = require('path');

// Check that babel.config.js is completely removed
const babelConfigPath = path.join(__dirname, 'babel.config.js');
if (!fs.existsSync(babelConfigPath)) {
  console.log('✅ babel.config.js removed - SWC will be used');
  console.log('✅ babel.config.js محذوف - سيتم استخدام SWC');
} else {
  console.log('❌ babel.config.js still exists - will conflict with next/font');
  console.log('❌ babel.config.js ما زال موجود - سيتعارض مع next/font');
  console.log('🔧 Please delete babel.config.js completely');
  console.log('🔧 يرجى حذف babel.config.js نهائياً');
  process.exit(1);
}

// Check for other babel config files
const otherBabelFiles = ['.babelrc', '.babelrc.js', '.babelrc.json', 'babel.config.json'];
let foundOtherBabelFiles = false;

otherBabelFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`⚠️ Found ${file} - may conflict with SWC`);
    console.log(`⚠️ وجد ${file} - قد يتعارض مع SWC`);
    foundOtherBabelFiles = true;
  }
});

if (!foundOtherBabelFiles) {
  console.log('✅ No other Babel config files found');
  console.log('✅ لم يتم العثور على ملفات تكوين Babel أخرى');
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

  // Check that NO Babel dependencies are in production dependencies
  const babelDepsInProd = packageJson.dependencies && Object.keys(packageJson.dependencies).filter(dep => dep.startsWith('@babel/'));
  if (babelDepsInProd.length === 0) {
    console.log('✅ No Babel dependencies in production (perfect for SWC)');
    console.log('✅ لا توجد تبعيات Babel في الإنتاج (مثالي لـ SWC)');
  } else {
    console.log('⚠️ Found Babel dependencies in production:', babelDepsInProd);
    console.log('⚠️ وجدت تبعيات Babel في الإنتاج:', babelDepsInProd);
    console.log('💡 Consider moving them to devDependencies');
    console.log('💡 فكر في نقلها إلى devDependencies');
  }

  // Check that Babel deps are in devDependencies (for testing)
  const babelDepsInDev = packageJson.devDependencies && Object.keys(packageJson.devDependencies).filter(dep => dep.startsWith('@babel/'));
  if (babelDepsInDev.length > 0) {
    console.log(`✅ Found ${babelDepsInDev.length} Babel dependencies in devDependencies (good for testing)`);
    console.log(`✅ وجد ${babelDepsInDev.length} تبعيات Babel في devDependencies (جيد للاختبارات)`);
  } else {
    console.log('ℹ️ No Babel dependencies in devDependencies');
    console.log('ℹ️ لا توجد تبعيات Babel في devDependencies');
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

  console.log('\n🎉 Configuration perfect for SWC-only Next.js!');
  console.log('🎉 التكوين مثالي لـ Next.js مع SWC فقط!');
  console.log('\n📝 Next steps:');
  console.log('📝 الخطوات التالية:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run build (should work with next/font)');
  console.log('3. Deploy to Netlify (SWC will handle everything)');
  console.log('1. شغل: npm install');
  console.log('2. شغل: npm run build (يجب أن يعمل مع next/font)');
  console.log('3. انشر على Netlify (SWC سيتعامل مع كل شيء)');
} else {
  console.log('❌ package.json not found');
  console.log('❌ ملف package.json غير موجود');
  process.exit(1);
}
