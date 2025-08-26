#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Quick Build Test');
console.log('🚀 اختبار بناء سريع');
console.log('='.repeat(50));

try {
  console.log('\n📋 Checking package.json...');
  if (!fs.existsSync('package.json')) {
    console.log('❌ package.json not found');
    process.exit(1);
  }
  console.log('✅ package.json found');

  console.log('\n🔧 Running TypeScript check...');
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { 
      stdio: 'pipe',
      timeout: 60000 
    });
    console.log('✅ TypeScript check passed');
  } catch (error) {
    console.log('❌ TypeScript check failed:');
    console.log(error.stdout?.toString() || error.message);
  }

  console.log('\n🏗️ Running Next.js build...');
  try {
    const output = execSync('npx next build', { 
      stdio: 'pipe',
      timeout: 180000,
      encoding: 'utf8'
    });
    console.log('✅ Build completed successfully!');
    console.log('✅ تم البناء بنجاح!');
    
    // Show last few lines of output
    const lines = output.split('\n').filter(line => line.trim());
    console.log('\n📊 Build output (last 10 lines):');
    lines.slice(-10).forEach(line => console.log(line));
    
  } catch (error) {
    console.log('❌ Build failed:');
    console.log('❌ فشل البناء:');
    
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
    const lines = errorOutput.split('\n');
    
    // Show error lines
    console.log('\n🔍 Error details:');
    lines.forEach(line => {
      if (line.includes('Error:') || line.includes('useAuth') || line.includes('AuthProvider')) {
        console.log('🔴', line);
      }
    });
    
    // Check if it's still the auth provider error
    if (errorOutput.includes('useAuth must be used within an AuthProvider')) {
      console.log('\n💡 Still have auth provider issues. Need to check:');
      console.log('1. Components that might still import from wrong auth provider');
      console.log('2. Pages that might have nested AuthProvider components');
      console.log('3. Components used in server-side rendering that use useAuth');
    }
  }

} catch (error) {
  console.log('❌ Unexpected error:', error.message);
}

console.log('\n🏁 Test completed');
console.log('🏁 اكتمل الاختبار');
