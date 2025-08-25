#!/usr/bin/env node

console.log('🔍 Checking Environment Variables...');
console.log('🔍 فحص متغيرات البيئة...');

const fs = require('fs');
const path = require('path');

// Check if .env.local exists
const envLocalPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example');

console.log('\n📁 Environment Files Check:');
console.log('📁 فحص ملفات البيئة:');

if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local exists');
  console.log('✅ ملف .env.local موجود');
} else {
  console.log('❌ .env.local missing');
  console.log('❌ ملف .env.local مفقود');
  
  // Try to create from .env.example
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env.local from .env.example...');
    console.log('📋 إنشاء .env.local من .env.example...');
    
    try {
      const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
      fs.writeFileSync(envLocalPath, exampleContent);
      console.log('✅ .env.local created successfully');
      console.log('✅ تم إنشاء .env.local بنجاح');
    } catch (error) {
      console.log(`❌ Failed to create .env.local: ${error.message}`);
      console.log(`❌ فشل في إنشاء .env.local: ${error.message}`);
    }
  } else {
    console.log('❌ .env.example also missing');
    console.log('❌ ملف .env.example مفقود أيضاً');
  }
}

// Check critical environment variables
console.log('\n🔑 Critical Environment Variables:');
console.log('🔑 متغيرات البيئة المهمة:');

const criticalVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_ADMIN_EMAIL',
  'NODE_ENV'
];

// Load environment variables from .env.local if it exists
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

criticalVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== 'your_value_here' && value !== 'your_domain.com') {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`⚠️ ${varName}: not set or placeholder`);
    console.log(`⚠️ ${varName}: غير مضبوط أو قيمة افتراضية`);
  }
});

// Check Netlify environment variables
console.log('\n🌐 Netlify Environment Check:');
console.log('🌐 فحص بيئة Netlify:');

if (process.env.NETLIFY) {
  console.log('✅ Running in Netlify environment');
  console.log('✅ يعمل في بيئة Netlify');
  
  // In Netlify, environment variables are set in the dashboard
  console.log('💡 Note: In Netlify, use dashboard to set environment variables');
  console.log('💡 ملاحظة: في Netlify، استخدم لوحة التحكم لضبط متغيرات البيئة');
} else {
  console.log('ℹ️ Running in local environment');
  console.log('ℹ️ يعمل في البيئة المحلية');
}

console.log('\n✅ Environment check completed!');
console.log('✅ اكتمل فحص البيئة!');
