#!/usr/bin/env node

/**
 * Fix Pages Folder Issue
 * إصلاح مشكلة مجلد الصفحات
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Pages Folder Issue');
console.log('🔧 إصلاح مشكلة مجلد الصفحات');
console.log('='.repeat(50));

// The issue: Next.js is treating src/components/pages/ as a pages directory
// Solution: Rename it to src/components/page-components/

const oldPath = 'src/components/pages';
const newPath = 'src/components/page-components';

try {
  // Check if old path exists
  if (!fs.existsSync(oldPath)) {
    console.log('❌ Old path does not exist:', oldPath);
    process.exit(1);
  }

  // Check if new path already exists
  if (fs.existsSync(newPath)) {
    console.log('⚠️ New path already exists:', newPath);
    console.log('Removing existing directory...');
    fs.rmSync(newPath, { recursive: true, force: true });
  }

  // Rename the directory
  fs.renameSync(oldPath, newPath);
  console.log('✅ Renamed directory:');
  console.log(`   ${oldPath} → ${newPath}`);

  // Now we need to update all import statements that reference the old path
  console.log('\n🔍 Updating import statements...');

  const filesToUpdate = [
    'src/app/[lang]/page.tsx',
    'src/app/[lang]/auth/page.tsx',
    'src/app/[lang]/auth/login/page.tsx',
    'src/app/[lang]/auth/register/page.tsx',
    'src/app/[lang]/tests/page.tsx',
    'src/app/[lang]/tests/[id]/page.tsx',
    'src/app/[lang]/results/page.tsx',
    'src/app/[lang]/results/[id]/page.tsx',
    'src/app/[lang]/history/page.tsx',
    'src/app/[lang]/contact/page.tsx',
    'src/app/[lang]/admin/page.tsx',
    'src/app/[lang]/image-analyzer/page.tsx',
    'src/app/[lang]/image-analysis/page.tsx',
    'src/app/[lang]/dashboard/page.tsx',
    'src/app/[lang]/settings/page.tsx'
  ];

  let updatedFiles = 0;

  filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Update import statements
        content = content.replace(
          /from ['"]@\/components\/pages\//g,
          "from '@/components/page-components/"
        );

        if (content !== originalContent) {
          fs.writeFileSync(filePath, content);
          console.log(`✅ Updated: ${filePath}`);
          updatedFiles++;
        }
      } catch (error) {
        console.log(`❌ Error updating ${filePath}:`, error.message);
      }
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`✅ Directory renamed: ${oldPath} → ${newPath}`);
  console.log(`✅ Updated ${updatedFiles} files`);

  console.log('\n🎉 Fix completed!');
  console.log('🎉 تم إكمال الإصلاح!');

} catch (error) {
  console.log('❌ Error:', error.message);
  process.exit(1);
}
