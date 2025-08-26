#!/usr/bin/env node

const fs = require('fs');

// Files and their component names that need default exports
const files = [
  { path: 'src/components/pages/enhanced-image-analyzer-page.tsx', name: 'EnhancedImageAnalyzerPage' },
  { path: 'src/components/pages/history-page.tsx', name: 'HistoryPage' },
  { path: 'src/components/pages/image-analyzer-page.tsx', name: 'ImageAnalyzerPage' },
  { path: 'src/components/pages/register-page.tsx', name: 'RegisterPage' },
  { path: 'src/components/pages/result-detail-page.tsx', name: 'ResultDetailPage' },
  { path: 'src/components/pages/results-page.tsx', name: 'ResultsPage' },
  { path: 'src/components/pages/test-page.tsx', name: 'TestPage' }
];

console.log('🔧 Adding default exports to remaining files...');

files.forEach(({ path, name }) => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    if (!content.includes('export default')) {
      if (!content.endsWith('\n')) {
        content += '\n';
      }
      content += `\nexport default ${name};\n`;
      
      fs.writeFileSync(path, content);
      console.log(`✅ Added default export to ${path}`);
    } else {
      console.log(`ℹ️ ${path} already has default export`);
    }
  } else {
    console.log(`❌ File not found: ${path}`);
  }
});

console.log('🎉 Done!');
