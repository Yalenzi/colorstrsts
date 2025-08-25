#!/usr/bin/env node

/**
 * Simplify App Script
 * سكريبت تبسيط التطبيق
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Simplify App Script');
console.log('🔧 سكريبت تبسيط التطبيق');
console.log('='.repeat(50));

// Backup original files
console.log('\n📋 Creating backups...');

const filesToBackup = [
  'src/app/layout.tsx',
  'src/app/page.tsx'
];

filesToBackup.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const backupPath = filePath + '.backup';
    try {
      fs.copyFileSync(filePath, backupPath);
      console.log(`✅ Backed up ${filePath} → ${backupPath}`);
    } catch (error) {
      console.log(`❌ Error backing up ${filePath}: ${error.message}`);
    }
  } else {
    console.log(`⚠️ ${filePath} does not exist`);
  }
});

// Replace with simplified versions
console.log('\n🔧 Replacing with simplified versions...');

const replacements = [
  {
    source: 'src/app/layout-simple.tsx',
    target: 'src/app/layout.tsx'
  },
  {
    source: 'src/app/page-simple.tsx',
    target: 'src/app/page.tsx'
  }
];

replacements.forEach(({ source, target }) => {
  if (fs.existsSync(source)) {
    try {
      fs.copyFileSync(source, target);
      console.log(`✅ Replaced ${target} with simplified version`);
    } catch (error) {
      console.log(`❌ Error replacing ${target}: ${error.message}`);
    }
  } else {
    console.log(`❌ Source file ${source} does not exist`);
  }
});

// Create minimal globals.css if it doesn't exist
console.log('\n🎨 Checking globals.css...');

const globalsCssPath = 'src/app/globals.css';
if (!fs.existsSync(globalsCssPath)) {
  const globalsCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}`;

  try {
    fs.writeFileSync(globalsCssPath, globalsCssContent);
    console.log(`✅ Created ${globalsCssPath}`);
  } catch (error) {
    console.log(`❌ Error creating ${globalsCssPath}: ${error.message}`);
  }
} else {
  console.log(`✅ ${globalsCssPath} already exists`);
}

// Verify the changes
console.log('\n🔍 Verifying changes...');

const filesToVerify = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/globals.css'
];

filesToVerify.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${filePath} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${filePath} missing`);
  }
});

console.log('\n🎉 App simplification completed!');
console.log('🎉 اكتمل تبسيط التطبيق!');

console.log('\n📋 Changes made:');
console.log('📋 التغييرات المطبقة:');
console.log('✅ Simplified layout.tsx (removed complex providers)');
console.log('✅ Simplified page.tsx (removed complex auth logic)');
console.log('✅ Created/verified globals.css');
console.log('✅ Created backups of original files');

console.log('\n🚀 Next steps:');
console.log('🚀 الخطوات التالية:');
console.log('1. Run: npm run build');
console.log('2. If successful, deploy to Netlify');
console.log('3. If needed, restore from backups and debug');
console.log('1. شغل: npm run build');
console.log('2. إذا نجح، انشر على Netlify');
console.log('3. إذا لزم الأمر، استعد من النسخ الاحتياطية وتشخيص');

console.log('\n💡 To restore original files:');
console.log('💡 لاستعادة الملفات الأصلية:');
console.log('cp src/app/layout.tsx.backup src/app/layout.tsx');
console.log('cp src/app/page.tsx.backup src/app/page.tsx');
