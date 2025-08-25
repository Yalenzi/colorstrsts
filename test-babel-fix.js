#!/usr/bin/env node

console.log('🔧 Testing Babel Configuration Fix...');
console.log('🔧 اختبار إصلاح تكوين Babel...');

const fs = require('fs');
const path = require('path');

// Check if babel.config.js exists
const babelConfigPath = path.join(__dirname, 'babel.config.js');
if (fs.existsSync(babelConfigPath)) {
  console.log('✅ babel.config.js exists');
  console.log('✅ ملف babel.config.js موجود');
} else {
  console.log('❌ babel.config.js missing');
  console.log('❌ ملف babel.config.js مفقود');
  process.exit(1);
}

// Check package.json for Babel dependencies
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = [
    '@babel/core',
    '@babel/plugin-transform-runtime',
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
    '@babel/runtime'
  ];
  
  console.log('\n📦 Checking Babel dependencies...');
  console.log('📦 فحص تبعيات Babel...');
  
  let allDepsFound = true;
  
  requiredDeps.forEach(dep => {
    const inDeps = packageJson.dependencies && packageJson.dependencies[dep];
    const inDevDeps = packageJson.devDependencies && packageJson.devDependencies[dep];
    
    if (inDeps || inDevDeps) {
      console.log(`✅ ${dep} found in ${inDeps ? 'dependencies' : 'devDependencies'}`);
    } else {
      console.log(`❌ ${dep} missing`);
      allDepsFound = false;
    }
  });
  
  if (allDepsFound) {
    console.log('\n🎉 All Babel dependencies are properly configured!');
    console.log('🎉 جميع تبعيات Babel مكونة بشكل صحيح!');
    console.log('\n📝 Next steps:');
    console.log('📝 الخطوات التالية:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run build');
    console.log('3. Deploy to Netlify');
    console.log('1. شغل: npm install');
    console.log('2. شغل: npm run build');
    console.log('3. انشر على Netlify');
  } else {
    console.log('\n❌ Some Babel dependencies are missing');
    console.log('❌ بعض تبعيات Babel مفقودة');
    process.exit(1);
  }
} else {
  console.log('❌ package.json not found');
  console.log('❌ ملف package.json غير موجود');
  process.exit(1);
}
