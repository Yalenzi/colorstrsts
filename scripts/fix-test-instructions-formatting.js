#!/usr/bin/env node

/**
 * Fix Test Instructions Formatting Script
 * سكريبت إصلاح تنسيق تعليمات الاختبارات
 * 
 * This script fixes formatting inconsistencies in chemical test instructions
 * هذا السكريبت يصلح عدم الاتساق في تنسيق تعليمات الاختبارات الكيميائية
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Test Instructions Formatting Fix');
console.log('إصلاح تنسيق تعليمات الاختبارات 🔧');
console.log('=====================================\n');

// Path to the main database file
const dbPath = path.join(__dirname, '..', 'src', 'data', 'Databsecolorstest.json');

/**
 * Fix formatting for a single prepare field
 * @param {string} prepareText - The original prepare text
 * @returns {string} - The formatted prepare text
 */
function fixPrepareFormatting(prepareText) {
  if (!prepareText || typeof prepareText !== 'string') {
    return prepareText;
  }

  // Remove extra spaces and normalize
  let fixed = prepareText.trim();
  
  // Fix common formatting issues
  fixed = fixed
    // Fix numbered steps without proper spacing
    .replace(/(\d+)\.([A-Z])/g, '$1. $2')
    // Fix missing spaces after periods in numbered steps
    .replace(/(\d+\.)([a-zA-Z])/g, '$1 $2')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Fix common reagent naming inconsistencies
    .replace(/reagent\s+(\d+)([A-Za-z])/g, 'reagent $1$2')
    .replace(/reagent\s+(\d+)\s+([A-Za-z])/g, 'reagent $1$2')
    // Fix measurement units
    .replace(/I00/g, '100')
    .replace(/0\.lN/g, '0.1N')
    // Split into proper numbered steps
    .split(/(?=\d+\.\s)/)
    .filter(step => step.trim())
    .map((step, index) => {
      step = step.trim();
      // Ensure step starts with number
      if (!step.match(/^\d+\./)) {
        step = `${index + 1}. ${step}`;
      }
      return step;
    })
    .join('\n');

  // Add observation step if not present
  if (!fixed.toLowerCase().includes('observe') && !fixed.toLowerCase().includes('راقب')) {
    const steps = fixed.split('\n');
    const lastStepNum = steps.length;
    fixed += `\n${lastStepNum + 1}. Observe the color change and record results.`;
  }

  return fixed;
}

/**
 * Fix Arabic prepare field formatting
 * @param {string} prepareArText - The original Arabic prepare text
 * @returns {string} - The formatted Arabic prepare text
 */
function fixPrepareArFormatting(prepareArText) {
  if (!prepareArText || typeof prepareArText !== 'string') {
    return prepareArText;
  }

  let fixed = prepareArText.trim();
  
  // Fix Arabic-specific formatting issues
  fixed = fixed
    // Fix numbered steps
    .replace(/(\d+)\.([أ-ي])/g, '$1. $2')
    .replace(/(\d+)\.([ا-ي])/g, '$1. $2')
    // Replace multiple spaces
    .replace(/\s+/g, ' ')
    // Fix common Arabic measurement issues
    .replace(/I00/g, '100')
    .replace(/0\.lN/g, '0.1 عادي')
    // Split into proper steps
    .split(/(?=\d+\.\s)/)
    .filter(step => step.trim())
    .map((step, index) => {
      step = step.trim();
      if (!step.match(/^\d+\./)) {
        step = `${index + 1}. ${step}`;
      }
      return step;
    })
    .join('\n');

  // Add Arabic observation step if not present
  if (!fixed.includes('راقب') && !fixed.includes('لاحظ') && !fixed.includes('سجل')) {
    const steps = fixed.split('\n');
    const lastStepNum = steps.length;
    fixed += `\n${lastStepNum + 1}. راقب تغيرات اللون وسجل النتائج.`;
  }

  return fixed;
}

/**
 * Process the database file
 */
function processDatabase() {
  try {
    console.log('📖 Reading database file...');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    if (!data.chemical_tests || !Array.isArray(data.chemical_tests)) {
      console.error('❌ Invalid database structure');
      return;
    }

    console.log(`📊 Found ${data.chemical_tests.length} chemical tests`);
    
    let fixedCount = 0;
    
    // Process each test
    data.chemical_tests.forEach((test, index) => {
      if (!test.id) return;
      
      let wasFixed = false;
      
      // Fix English prepare field
      if (test.prepare && typeof test.prepare === 'string') {
        const originalPrepare = test.prepare;
        const fixedPrepare = fixPrepareFormatting(originalPrepare);
        
        if (originalPrepare !== fixedPrepare) {
          test.prepare = fixedPrepare;
          wasFixed = true;
          console.log(`✅ Fixed English instructions for: ${test.method_name || test.id}`);
        }
      }
      
      // Fix Arabic prepare field
      if (test.prepare_ar && typeof test.prepare_ar === 'string') {
        const originalPrepareAr = test.prepare_ar;
        const fixedPrepareAr = fixPrepareArFormatting(originalPrepareAr);
        
        if (originalPrepareAr !== fixedPrepareAr) {
          test.prepare_ar = fixedPrepareAr;
          wasFixed = true;
          console.log(`✅ Fixed Arabic instructions for: ${test.method_name_ar || test.id}`);
        }
      }
      
      if (wasFixed) {
        fixedCount++;
      }
    });
    
    // Write back to file
    console.log(`\n💾 Writing fixed data back to file...`);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`\n🎉 Formatting fix completed!`);
    console.log(`📊 Total tests processed: ${data.chemical_tests.length}`);
    console.log(`✅ Tests with fixed formatting: ${fixedCount}`);
    console.log(`📁 Updated file: ${dbPath}`);
    
  } catch (error) {
    console.error('❌ Error processing database:', error.message);
    process.exit(1);
  }
}

/**
 * Validate the fixes
 */
function validateFixes() {
  try {
    console.log('\n🔍 Validating fixes...');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    let issuesFound = 0;
    
    data.chemical_tests.forEach(test => {
      // Check for common formatting issues
      if (test.prepare) {
        if (test.prepare.includes('  ') || // Multiple spaces
            test.prepare.match(/\d+\.[A-Z]/) || // Missing space after number
            test.prepare.includes('I00') || // Common typo
            !test.prepare.includes('\n')) { // No line breaks
          console.log(`⚠️  Potential issue in ${test.method_name}: ${test.prepare.substring(0, 50)}...`);
          issuesFound++;
        }
      }
    });
    
    if (issuesFound === 0) {
      console.log('✅ All formatting looks good!');
    } else {
      console.log(`⚠️  Found ${issuesFound} potential formatting issues`);
    }
    
  } catch (error) {
    console.error('❌ Error validating fixes:', error.message);
  }
}

// Main execution
if (require.main === module) {
  processDatabase();
  validateFixes();
  
  console.log('\n📋 Next Steps:');
  console.log('1. Test the application to ensure all instructions display correctly');
  console.log('2. Check both Arabic and English versions');
  console.log('3. Verify the Fast Blue B Salt Test specifically');
  console.log('4. Update any cached data if necessary');
  
  console.log('\n✅ Script completed successfully!');
}

module.exports = {
  fixPrepareFormatting,
  fixPrepareArFormatting,
  processDatabase,
  validateFixes
};
