#!/usr/bin/env node

/**
 * Simple Build Script for Netlify
 * سكريبت بناء بسيط لـ Netlify
 */

console.log('🚀 Starting build process...');
console.log('🚀 بدء عملية البناء...');

const { spawn } = require('child_process');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.NETLIFY = 'true';
process.env.NEXT_TELEMETRY_DISABLED = '1';

console.log('🌍 Environment set for production build');
console.log('🌍 تم تعيين البيئة للبناء الإنتاجي');

// Run Next.js build
console.log('📦 Running Next.js build...');
console.log('📦 تشغيل بناء Next.js...');

const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: process.env
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
    console.log('✅ اكتمل البناء بنجاح!');
    process.exit(0);
  } else {
    console.log(`❌ Build failed with exit code ${code}`);
    console.log(`❌ فشل البناء برمز الخروج ${code}`);
    process.exit(code);
  }
});

buildProcess.on('error', (error) => {
  console.log(`❌ Build error: ${error.message}`);
  console.log(`❌ خطأ في البناء: ${error.message}`);
  process.exit(1);
});
