#!/usr/bin/env node

console.log('🔍 Checking netlify.toml file...');
console.log('🔍 فحص ملف netlify.toml...');

const fs = require('fs');

try {
  const content = fs.readFileSync('netlify.toml', 'utf8');
  
  console.log('\n📋 File Analysis:');
  console.log('📋 تحليل الملف:');
  
  // Check for duplicate [build.environment] sections
  const buildEnvMatches = content.match(/\[build\.environment\]/g);
  if (buildEnvMatches && buildEnvMatches.length > 1) {
    console.log('❌ Multiple [build.environment] sections found');
    console.log('❌ وجد عدة أقسام [build.environment]');
  } else {
    console.log('✅ Single [build.environment] section');
    console.log('✅ قسم [build.environment] واحد');
  }
  
  // Check build command
  if (content.includes('npm install && npm run build')) {
    console.log('✅ Simple build command found');
    console.log('✅ أمر بناء بسيط موجود');
  }
  
  // Check Node version
  if (content.includes('NODE_VERSION = "18.19.0"')) {
    console.log('✅ Node.js 18.19.0 specified');
    console.log('✅ تم تحديد Node.js 18.19.0');
  }
  
  // Check publish directory
  if (content.includes('publish = "out"')) {
    console.log('✅ Publish directory set to "out"');
    console.log('✅ مجلد النشر مضبوط على "out"');
  }
  
  console.log('\n✅ netlify.toml validation completed!');
  console.log('✅ اكتمل التحقق من netlify.toml!');
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  console.log(`❌ خطأ: ${error.message}`);
}
