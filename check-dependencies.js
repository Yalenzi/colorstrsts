#!/usr/bin/env node

/**
 * Check Dependencies Script
 * سكريبت فحص التبعيات
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking dependencies...');
console.log('🔍 فحص التبعيات...');

// Read package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Critical dependencies that must be present
const criticalDeps = {
  'react': 'React library',
  'react-dom': 'React DOM library',
  'next': 'Next.js framework',
  'typescript': 'TypeScript compiler',
  '@types/react': 'React TypeScript types',
  '@types/react-dom': 'React DOM TypeScript types',
  '@types/node': 'Node.js TypeScript types',
  'tailwindcss': 'Tailwind CSS',
  'autoprefixer': 'PostCSS Autoprefixer',
  'postcss': 'PostCSS',
  'firebase': 'Firebase SDK',
  '@heroicons/react': 'Heroicons React',
  'cross-env': 'Cross-platform environment variables',
  '@babel/core': 'Babel core compiler',
  '@babel/plugin-transform-runtime': 'Babel transform runtime plugin',
  '@babel/runtime': 'Babel runtime helpers'
};

console.log('\n📋 Critical Dependencies Check:');
console.log('📋 فحص التبعيات المهمة:');
console.log('='.repeat(50));

let missingCount = 0;
let foundCount = 0;

const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

for (const [dep, description] of Object.entries(criticalDeps)) {
  if (allDeps[dep]) {
    console.log(`✅ ${dep} (${allDeps[dep]}) - ${description}`);
    foundCount++;
  } else {
    console.log(`❌ ${dep} - MISSING - ${description}`);
    missingCount++;
  }
}

console.log('\n📊 Summary / الملخص:');
console.log(`✅ Found: ${foundCount}`);
console.log(`❌ Missing: ${missingCount}`);

// Check for common issues
console.log('\n🔍 Common Issues Check:');
console.log('🔍 فحص المشاكل الشائعة:');

// Check if next-env.d.ts exists
if (fs.existsSync('next-env.d.ts')) {
  console.log('✅ next-env.d.ts exists');
} else {
  console.log('❌ next-env.d.ts missing');
}

// Check if tsconfig.json exists
if (fs.existsSync('tsconfig.json')) {
  console.log('✅ tsconfig.json exists');
} else {
  console.log('❌ tsconfig.json missing');
}

// Check if next.config.js exists
if (fs.existsSync('next.config.js')) {
  console.log('✅ next.config.js exists');
} else {
  console.log('❌ next.config.js missing');
}

// Check if package-lock.json exists
if (fs.existsSync('package-lock.json')) {
  console.log('✅ package-lock.json exists');
} else {
  console.log('❌ package-lock.json missing');
}

// Check src directory structure
const srcDirs = ['src/app', 'src/components', 'src/lib', 'src/types'];
console.log('\n📁 Source Directory Check:');
srcDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir} exists`);
  } else {
    console.log(`❌ ${dir} missing`);
  }
});

// Check for potential problematic imports
console.log('\n🔍 Checking for potential import issues...');

const checkFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for problematic imports
    const problematicImports = [
      /from ['"]@\/[^'"]*['"]/g,
      /import.*from ['"][^'"]*\.js['"]/g,
      /import.*from ['"][^'"]*\.jsx['"]/g
    ];
    
    problematicImports.forEach((regex, index) => {
      const matches = content.match(regex);
      if (matches) {
        console.log(`⚠️ ${filePath} has potential import issues:`, matches.slice(0, 3));
      }
    });
  } catch (error) {
    console.log(`❌ Error reading ${filePath}:`, error.message);
  }
};

// Check key files
const keyFiles = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/components/providers.tsx',
  'src/lib/firebase.ts'
];

keyFiles.forEach(checkFile);

if (missingCount > 0) {
  console.log('\n🚨 Action Required:');
  console.log('🚨 إجراء مطلوب:');
  console.log('Run: npm install to install missing dependencies');
  console.log('قم بتشغيل: npm install لتثبيت التبعيات المفقودة');
  process.exit(1);
} else {
  console.log('\n✅ All critical dependencies are present!');
  console.log('✅ جميع التبعيات المهمة موجودة!');
}
