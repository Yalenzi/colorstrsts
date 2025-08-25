#!/usr/bin/env node

/**
 * Fix Dependencies Script
 * سكريبت إصلاح التبعيات
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing dependencies...');
console.log('🔧 إصلاح التبعيات...');

// Read package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('\n📋 Current Dependencies:');
console.log('📋 التبعيات الحالية:');

// Check dependencies
const deps = packageJson.dependencies || {};
const devDeps = packageJson.devDependencies || {};
const allDeps = { ...deps, ...devDeps };

console.log(`Dependencies: ${Object.keys(deps).length}`);
console.log(`Dev Dependencies: ${Object.keys(devDeps).length}`);
console.log(`Total: ${Object.keys(allDeps).length}`);

// Critical dependencies that must be present
const criticalDeps = {
  // Core
  'react': '^18.3.0',
  'react-dom': '^18.3.0',
  'next': '^15.0.0',
  'typescript': '^5.3.0',
  
  // Types
  '@types/react': '^18.2.48',
  '@types/react-dom': '^18.2.18',
  '@types/node': '^20.11.0',
  
  // Babel
  '@babel/runtime': '^7.23.0',
  
  // Styling
  'tailwindcss': '^3.4.1',
  'autoprefixer': '^10.4.17',
  'postcss': '^8.4.33',
  
  // Utils
  'cross-env': '^7.0.3',
  'clsx': '^2.1.0',
  'tailwind-merge': '^3.3.1'
};

const criticalDevDeps = {
  // Babel
  '@babel/core': '^7.23.0',
  '@babel/plugin-transform-runtime': '^7.23.0',
  '@babel/preset-env': '^7.23.0',
  '@babel/preset-react': '^7.23.0',
  '@babel/preset-typescript': '^7.23.0',
  'babel-loader': '^9.1.3',
  
  // ESLint
  'eslint': '^8.56.0',
  'eslint-config-next': '^15.0.0',
  '@typescript-eslint/eslint-plugin': '^6.19.0',
  '@typescript-eslint/parser': '^6.19.0'
};

console.log('\n🔍 Checking critical dependencies...');
console.log('🔍 فحص التبعيات المهمة...');

let missingDeps = [];
let missingDevDeps = [];

// Check critical dependencies
for (const [dep, version] of Object.entries(criticalDeps)) {
  if (!allDeps[dep]) {
    missingDeps.push(`"${dep}": "${version}"`);
    console.log(`❌ Missing: ${dep}`);
  } else {
    console.log(`✅ Found: ${dep} (${allDeps[dep]})`);
  }
}

// Check critical dev dependencies
for (const [dep, version] of Object.entries(criticalDevDeps)) {
  if (!allDeps[dep]) {
    missingDevDeps.push(`"${dep}": "${version}"`);
    console.log(`❌ Missing dev: ${dep}`);
  } else {
    console.log(`✅ Found dev: ${dep} (${allDeps[dep]})`);
  }
}

// Generate fix commands
if (missingDeps.length > 0 || missingDevDeps.length > 0) {
  console.log('\n🚨 Missing dependencies found!');
  console.log('🚨 تم العثور على تبعيات مفقودة!');
  
  if (missingDeps.length > 0) {
    console.log('\n📦 Add these to dependencies:');
    console.log('📦 أضف هذه إلى dependencies:');
    missingDeps.forEach(dep => console.log(`  ${dep},`));
  }
  
  if (missingDevDeps.length > 0) {
    console.log('\n🛠️ Add these to devDependencies:');
    console.log('🛠️ أضف هذه إلى devDependencies:');
    missingDevDeps.forEach(dep => console.log(`  ${dep},`));
  }
  
  console.log('\n💡 Suggested npm install commands:');
  console.log('💡 أوامر npm install المقترحة:');
  
  if (missingDeps.length > 0) {
    const depNames = missingDeps.map(dep => dep.split('"')[1]).join(' ');
    console.log(`npm install ${depNames}`);
  }
  
  if (missingDevDeps.length > 0) {
    const devDepNames = missingDevDeps.map(dep => dep.split('"')[1]).join(' ');
    console.log(`npm install --save-dev ${devDepNames}`);
  }
  
} else {
  console.log('\n✅ All critical dependencies are present!');
  console.log('✅ جميع التبعيات المهمة موجودة!');
}

console.log('\n🔧 Dependency fix check completed!');
console.log('🔧 اكتمل فحص إصلاح التبعيات!');
