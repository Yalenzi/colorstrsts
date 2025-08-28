#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files that need to be fixed
const filesToFix = [
  'src/app/[lang]/page.tsx',
  'src/app/[lang]/tests/page.tsx',
  'src/app/[lang]/tests/[testId]/page.tsx',
  'src/app/[lang]/results/[id]/page.tsx',
  'src/app/[lang]/image-analyzer/page.tsx',
  'src/app/[lang]/profile/page.tsx',
  'src/app/[lang]/safety/page.tsx',
  'src/app/[lang]/history/page.tsx',
  'src/app/[lang]/contact/page.tsx',
  'src/app/[lang]/dashboard/page.tsx',
  'src/app/[lang]/auth/page.tsx',
  'src/app/[lang]/test-validation/page.tsx'
];

function fixParamsInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix 1: Change Promise<{ lang: Language }> to { lang: Language }
  const promiseParamsRegex = /params:\s*Promise<\{\s*lang:\s*Language[^}]*\}>/g;
  if (content.match(promiseParamsRegex)) {
    content = content.replace(promiseParamsRegex, (match) => {
      const innerType = match.match(/Promise<(.+)>/)[1];
      return `params: ${innerType}`;
    });
    modified = true;
    console.log(`✅ Fixed Promise params in ${filePath}`);
  }

  // Fix 2: Remove await from params usage
  const awaitParamsRegex = /const\s+\{\s*([^}]+)\s*\}\s*=\s*await\s+params;/g;
  if (content.match(awaitParamsRegex)) {
    content = content.replace(awaitParamsRegex, 'const { $1 } = params;');
    modified = true;
    console.log(`✅ Fixed await params in ${filePath}`);
  }

  // Fix 3: Remove params.then() usage
  const paramsThenRegex = /params\.then\(\(\{\s*([^}]+)\s*\}\)\s*=>\s*[^)]+\);?/g;
  if (content.match(paramsThenRegex)) {
    content = content.replace(paramsThenRegex, (match) => {
      const paramName = match.match(/\{\s*([^}]+)\s*\}/)[1].trim();
      return `// Params extracted directly: const ${paramName} = params.${paramName};`;
    });
    modified = true;
    console.log(`✅ Fixed params.then() in ${filePath}`);
  }

  // Fix 4: Remove useEffect with params.then
  const useEffectParamsRegex = /useEffect\(\(\)\s*=>\s*\{\s*params\.then\([^}]+\}[^}]+\}\);?\s*\},\s*\[params\]\);?/g;
  if (content.match(useEffectParamsRegex)) {
    content = content.replace(useEffectParamsRegex, '// Params extracted directly in component');
    modified = true;
    console.log(`✅ Fixed useEffect params.then in ${filePath}`);
  }

  // Fix 5: Fix generateMetadata function
  const generateMetadataRegex = /export\s+async\s+function\s+generateMetadata\(\{\s*params[^}]*\}[^{]*\{[^}]*const\s+\{\s*([^}]+)\s*\}\s*=\s*await\s+params;/g;
  if (content.match(generateMetadataRegex)) {
    content = content.replace(generateMetadataRegex, (match) => {
      return match.replace('await params', 'params');
    });
    modified = true;
    console.log(`✅ Fixed generateMetadata in ${filePath}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`💾 Saved changes to ${filePath}`);
  } else {
    console.log(`ℹ️ No changes needed in ${filePath}`);
  }
}

function main() {
  console.log('🔧 Starting params fix for Next.js compatibility...\n');

  filesToFix.forEach(filePath => {
    console.log(`\n📁 Processing: ${filePath}`);
    fixParamsInFile(filePath);
  });

  console.log('\n✅ Params fix completed!');
  console.log('\n📋 Summary:');
  console.log('- Changed Promise<{ lang: Language }> to { lang: Language }');
  console.log('- Removed await from params usage');
  console.log('- Removed params.then() calls');
  console.log('- Fixed useEffect with params');
  console.log('- Fixed generateMetadata functions');
  console.log('\n🚀 The app should now work without React errors!');
}

if (require.main === module) {
  main();
}

module.exports = { fixParamsInFile };
