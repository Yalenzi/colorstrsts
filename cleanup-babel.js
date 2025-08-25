#!/usr/bin/env node

console.log('🧹 Cleaning up Babel configuration files...');
console.log('🧹 تنظيف ملفات تكوين Babel...');

const fs = require('fs');
const path = require('path');

const filesToRemove = [
  'babel.config.js',
  'babel.config.json',
  '.babelrc',
  '.babelrc.js',
  '.babelrc.json'
];

let removedFiles = 0;

filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${file}`);
      console.log(`✅ تم حذف: ${file}`);
      removedFiles++;
    } catch (error) {
      console.log(`❌ Failed to remove: ${file} - ${error.message}`);
      console.log(`❌ فشل في حذف: ${file} - ${error.message}`);
    }
  } else {
    console.log(`ℹ️ Not found: ${file} (already clean)`);
    console.log(`ℹ️ غير موجود: ${file} (نظيف بالفعل)`);
  }
});

if (removedFiles > 0) {
  console.log(`\n🎉 Cleaned up ${removedFiles} Babel configuration file(s)`);
  console.log(`🎉 تم تنظيف ${removedFiles} ملف تكوين Babel`);
} else {
  console.log('\n✨ No Babel configuration files found - already clean!');
  console.log('✨ لم يتم العثور على ملفات تكوين Babel - نظيف بالفعل!');
}

console.log('\n📝 Next.js will now use SWC by default');
console.log('📝 Next.js سيستخدم SWC افتراضياً الآن');
