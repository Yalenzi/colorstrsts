#!/usr/bin/env node

console.log('🗑️ Removing all Babel configuration files...');
console.log('🗑️ حذف جميع ملفات تكوين Babel...');

const fs = require('fs');
const path = require('path');

const babelFiles = [
  'babel.config.js',
  'babel.config.json',
  '.babelrc',
  '.babelrc.js',
  '.babelrc.json',
  'babel.config.mjs',
  '.babelrc.mjs'
];

let removedCount = 0;

babelFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`✅ Removed: ${file}`);
      console.log(`✅ تم حذف: ${file}`);
      removedCount++;
    } catch (error) {
      console.log(`❌ Failed to remove ${file}: ${error.message}`);
      console.log(`❌ فشل في حذف ${file}: ${error.message}`);
    }
  } else {
    console.log(`ℹ️ Not found: ${file}`);
    console.log(`ℹ️ غير موجود: ${file}`);
  }
});

if (removedCount > 0) {
  console.log(`\n🎉 Removed ${removedCount} Babel configuration file(s)`);
  console.log(`🎉 تم حذف ${removedCount} ملف تكوين Babel`);
} else {
  console.log('\n✨ No Babel configuration files found');
  console.log('✨ لم يتم العثور على ملفات تكوين Babel');
}

console.log('\n📝 Next.js will now use SWC by default');
console.log('📝 Next.js سيستخدم SWC افتراضياً الآن');
console.log('📝 This should fix the next/font issue');
console.log('📝 هذا يجب أن يحل مشكلة next/font');
