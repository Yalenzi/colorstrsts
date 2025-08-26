#!/usr/bin/env node

console.log('🚀 Simple and Reliable Fix');
console.log('🚀 إصلاح بسيط وموثوق');

const { execSync } = require('child_process');

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

console.log('\n🎉 Simple fix completed!');
console.log('🎉 اكتمل الإصلاح البسيط!');
