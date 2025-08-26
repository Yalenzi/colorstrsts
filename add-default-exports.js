#!/usr/bin/env node

/**
 * Add Default Exports to Page Components
 * إضافة تصدير افتراضي لمكونات الصفحات
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Adding Default Exports to Page Components');
console.log('🔧 إضافة تصدير افتراضي لمكونات الصفحات');
console.log('='.repeat(50));

// List of files that need default exports
const pageFiles = [
  {
    file: 'src/components/pages/admin-page.tsx',
    componentName: 'AdminPage'
  },
  {
    file: 'src/components/pages/contact-page.tsx',
    componentName: 'ContactPage'
  },
  {
    file: 'src/components/pages/enhanced-image-analyzer-page.tsx',
    componentName: 'EnhancedImageAnalyzerPage'
  },
  {
    file: 'src/components/pages/history-page.tsx',
    componentName: 'HistoryPage'
  },
  {
    file: 'src/components/pages/image-analyzer-page.tsx',
    componentName: 'ImageAnalyzerPage'
  },
  {
    file: 'src/components/pages/register-page.tsx',
    componentName: 'RegisterPage'
  },
  {
    file: 'src/components/pages/result-detail-page.tsx',
    componentName: 'ResultDetailPage'
  },
  {
    file: 'src/components/pages/results-page.tsx',
    componentName: 'ResultsPage'
  },
  {
    file: 'src/components/pages/test-page.tsx',
    componentName: 'TestPage'
  },
  {
    file: 'src/components/pages/tests-page.tsx',
    componentName: 'TestsPage'
  }
];

let processedFiles = 0;
let errors = 0;

pageFiles.forEach(({ file, componentName }) => {
  if (!fs.existsSync(file)) {
    console.log(`⚠️ File not found: ${file}`);
    return;
  }

  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if default export already exists
    if (content.includes('export default')) {
      console.log(`✅ ${file} - Already has default export`);
      return;
    }

    // Find the component function export
    const exportRegex = new RegExp(`export function ${componentName}`, 'g');
    if (!exportRegex.test(content)) {
      console.log(`⚠️ ${file} - Could not find export function ${componentName}`);
      return;
    }

    // Add default export at the end
    if (!content.endsWith('\n')) {
      content += '\n';
    }
    content += `\nexport default ${componentName};\n`;

    // Write the updated content
    fs.writeFileSync(file, content);
    console.log(`✅ ${file} - Added default export for ${componentName}`);
    processedFiles++;

  } catch (error) {
    console.log(`❌ Error processing ${file}:`, error.message);
    errors++;
  }
});

console.log('\n📊 Summary:');
console.log(`✅ Processed: ${processedFiles} files`);
console.log(`❌ Errors: ${errors} files`);

if (errors === 0) {
  console.log('\n🎉 All page components now have default exports!');
  console.log('🎉 جميع مكونات الصفحات لديها الآن تصدير افتراضي!');
} else {
  console.log('\n⚠️ Some files had errors. Please check manually.');
  console.log('⚠️ بعض الملفات بها أخطاء. يرجى التحقق يدوياً.');
}
