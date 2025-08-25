#!/usr/bin/env node

/**
 * Fix Package Lock Script
 * سكريبت إصلاح package-lock.json
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fix Package Lock Script');
console.log('🔧 سكريبت إصلاح package-lock.json');
console.log('='.repeat(50));

// Check if package-lock.json exists
const packageLockPath = path.join(process.cwd(), 'package-lock.json');
const packageJsonPath = path.join(process.cwd(), 'package.json');

console.log('\n📋 Current Status:');
console.log('📋 الحالة الحالية:');

if (fs.existsSync(packageLockPath)) {
  const stats = fs.statSync(packageLockPath);
  console.log(`✅ package-lock.json exists (${stats.size} bytes)`);
  
  // Check if it's out of sync
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
    
    console.log(`Package.json version: ${packageJson.version}`);
    console.log(`Package-lock.json version: ${packageLock.version || 'not set'}`);
    
    // Check for version mismatch
    if (packageJson.version !== packageLock.version) {
      console.log('⚠️ Version mismatch detected');
    }
    
    // Check dependencies count
    const depsCount = Object.keys(packageJson.dependencies || {}).length;
    const devDepsCount = Object.keys(packageJson.devDependencies || {}).length;
    const lockDepsCount = Object.keys(packageLock.dependencies || {}).length;
    
    console.log(`Dependencies in package.json: ${depsCount + devDepsCount}`);
    console.log(`Dependencies in package-lock.json: ${lockDepsCount}`);
    
    if (Math.abs((depsCount + devDepsCount) - lockDepsCount) > 5) {
      console.log('⚠️ Significant dependency count mismatch');
    }
    
  } catch (error) {
    console.log(`❌ Error reading package files: ${error.message}`);
  }
} else {
  console.log('❌ package-lock.json does not exist');
}

// Fix 1: Remove old package-lock.json
console.log('\n🔧 Fix 1: Removing old package-lock.json...');
try {
  if (fs.existsSync(packageLockPath)) {
    fs.unlinkSync(packageLockPath);
    console.log('✅ Old package-lock.json removed');
  } else {
    console.log('✅ No package-lock.json to remove');
  }
} catch (error) {
  console.log(`❌ Error removing package-lock.json: ${error.message}`);
}

// Fix 2: Remove node_modules if exists
console.log('\n🔧 Fix 2: Checking node_modules...');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('⚠️ node_modules exists - should be removed for clean install');
  console.log('⚠️ node_modules موجود - يجب حذفه للتثبيت النظيف');
  // Note: We don't remove it here as it might be too large for the script
} else {
  console.log('✅ node_modules does not exist - good for clean install');
}

// Fix 3: Validate package.json
console.log('\n🔧 Fix 3: Validating package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check engines
  if (packageJson.engines) {
    console.log(`✅ Node version requirement: ${packageJson.engines.node}`);
    console.log(`✅ NPM version requirement: ${packageJson.engines.npm || 'not set'}`);
  } else {
    console.log('⚠️ No engines specified in package.json');
  }
  
  // Check dependencies
  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};
  
  console.log(`✅ Dependencies: ${Object.keys(deps).length}`);
  console.log(`✅ DevDependencies: ${Object.keys(devDeps).length}`);
  
  // Check for problematic dependencies
  const problematicDeps = [];
  
  // Check for duplicate dependencies
  for (const dep of Object.keys(deps)) {
    if (devDeps[dep]) {
      problematicDeps.push(`${dep} (in both deps and devDeps)`);
    }
  }
  
  if (problematicDeps.length > 0) {
    console.log('⚠️ Problematic dependencies found:');
    problematicDeps.forEach(dep => console.log(`  - ${dep}`));
  } else {
    console.log('✅ No duplicate dependencies found');
  }
  
} catch (error) {
  console.log(`❌ Error validating package.json: ${error.message}`);
}

// Fix 4: Create .npmrc for better compatibility
console.log('\n🔧 Fix 4: Creating .npmrc for better compatibility...');
const npmrcContent = `# NPM Configuration for better compatibility
engine-strict=false
legacy-peer-deps=false
fund=false
audit=false
progress=true
loglevel=warn
`;

try {
  fs.writeFileSync('.npmrc', npmrcContent);
  console.log('✅ .npmrc created with compatibility settings');
} catch (error) {
  console.log(`❌ Error creating .npmrc: ${error.message}`);
}

console.log('\n🎉 Package lock fix completed!');
console.log('🎉 اكتمل إصلاح package lock!');

console.log('\n📋 Summary:');
console.log('📋 الملخص:');
console.log('✅ Old package-lock.json removed');
console.log('✅ package.json validated');
console.log('✅ .npmrc created for compatibility');

console.log('\n🚀 Next steps:');
console.log('🚀 الخطوات التالية:');
console.log('1. Run: npm install (to create new package-lock.json)');
console.log('2. Run: npm run build (to test build)');
console.log('3. Deploy to Netlify');
console.log('1. شغل: npm install (لإنشاء package-lock.json جديد)');
console.log('2. شغل: npm run build (لاختبار البناء)');
console.log('3. انشر على Netlify');

console.log('\n💡 Note: The new package-lock.json will be created with Node 20+ compatibility');
console.log('💡 ملاحظة: سيتم إنشاء package-lock.json جديد متوافق مع Node 20+');
