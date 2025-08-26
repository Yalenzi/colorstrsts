#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Searching for force-dynamic in src/app...');
console.log('🔍 البحث عن force-dynamic في src/app...');

function searchInDirectory(dir) {
  const results = [];
  
  function searchRecursive(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          searchRecursive(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.js') || item.endsWith('.jsx')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('force-dynamic')) {
              const lines = content.split('\n');
              lines.forEach((line, index) => {
                if (line.includes('force-dynamic')) {
                  results.push({
                    file: fullPath,
                    line: index + 1,
                    content: line.trim()
                  });
                }
              });
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  searchRecursive(dir);
  return results;
}

const results = searchInDirectory('src/app');

if (results.length === 0) {
  console.log('✅ No force-dynamic found in src/app');
  console.log('✅ لم يتم العثور على force-dynamic في src/app');
} else {
  console.log(`⚠️ Found ${results.length} instances of force-dynamic:`);
  console.log(`⚠️ تم العثور على ${results.length} حالات force-dynamic:`);
  
  results.forEach(result => {
    console.log(`\n📁 File: ${result.file}`);
    console.log(`📍 Line ${result.line}: ${result.content}`);
  });
}

console.log('\n🔍 Search completed!');
console.log('🔍 اكتمل البحث!');
