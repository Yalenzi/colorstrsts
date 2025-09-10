#!/usr/bin/env node

/**
 * Test Import Fix Verification
 * التحقق من إصلاح مشكلة الاستيراد
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing useTestTimer import fix...');
console.log('🔍 اختبار إصلاح استيراد useTestTimer...');

// Files that should import useTestTimer correctly
const filesToCheck = [
  'src/components/ui/FixedColorSelector.tsx',
  'src/components/ui/color-selector.tsx'
];

let allCorrect = true;

filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${filePath} - File not found`);
    allCorrect = false;
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it imports useTestTimer from the correct location
    if (content.includes('useTestTimer') && content.includes("from '@/hooks/useTestCompletion'")) {
      console.log(`✅ ${filePath} - Correct import`);
    } else if (content.includes('useTestTimer') && content.includes("from '@/hooks/useTestTimer'")) {
      console.log(`❌ ${filePath} - Wrong import (should be from useTestCompletion)`);
      allCorrect = false;
    } else if (content.includes('useTestTimer')) {
      console.log(`⚠️ ${filePath} - useTestTimer found but import unclear`);
      allCorrect = false;
    } else {
      console.log(`ℹ️ ${filePath} - No useTestTimer usage`);
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    allCorrect = false;
  }
});

// Check that useTestTimer is exported from useTestCompletion
const useTestCompletionPath = 'src/hooks/useTestCompletion.ts';
if (fs.existsSync(useTestCompletionPath)) {
  try {
    const content = fs.readFileSync(useTestCompletionPath, 'utf8');
    if (content.includes('export function useTestTimer')) {
      console.log(`✅ ${useTestCompletionPath} - useTestTimer is exported`);
    } else {
      console.log(`❌ ${useTestCompletionPath} - useTestTimer is NOT exported`);
      allCorrect = false;
    }
  } catch (error) {
    console.log(`❌ Error reading ${useTestCompletionPath}: ${error.message}`);
    allCorrect = false;
  }
} else {
  console.log(`❌ ${useTestCompletionPath} - File not found`);
  allCorrect = false;
}

console.log('\n' + '='.repeat(50));
if (allCorrect) {
  console.log('✅ All imports are correct!');
  console.log('✅ جميع الاستيرادات صحيحة!');
  console.log('🚀 Ready for Netlify deployment');
  console.log('🚀 جاهز للنشر على Netlify');
} else {
  console.log('❌ Some imports need fixing');
  console.log('❌ بعض الاستيرادات تحتاج إصلاح');
}
console.log('='.repeat(50));
