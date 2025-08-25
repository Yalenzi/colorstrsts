#!/usr/bin/env node

/**
 * Netlify Build Debug Script
 * سكريبت تشخيص مشاكل بناء Netlify
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Netlify Build Debug Script');
console.log('🔍 سكريبت تشخيص مشاكل بناء Netlify');
console.log('='.repeat(50));

// Environment check
console.log('\n🌍 Environment Check:');
console.log(`Node Version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`CWD: ${process.cwd()}`);

// Check critical files
console.log('\n📁 Critical Files Check:');
const criticalFiles = [
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tsconfig.json',
  'tsconfig.build.json',
  '.babelrc',
  'next-env.d.ts',
  'netlify.toml',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/lib/firebase.ts'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
  }
});

// Check package.json
console.log('\n📦 Package.json Analysis:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  console.log(`Name: ${packageJson.name}`);
  console.log(`Version: ${packageJson.version}`);
  
  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};
  
  console.log(`Dependencies: ${Object.keys(deps).length}`);
  console.log(`DevDependencies: ${Object.keys(devDeps).length}`);
  
  // Check critical dependencies
  const criticalDeps = [
    'react', 'react-dom', 'next', 'typescript',
    '@babel/runtime', 'babel-loader'
  ];
  
  console.log('\n🔍 Critical Dependencies:');
  criticalDeps.forEach(dep => {
    if (deps[dep] || devDeps[dep]) {
      console.log(`✅ ${dep}: ${deps[dep] || devDeps[dep]}`);
    } else {
      console.log(`❌ ${dep}: MISSING`);
    }
  });
  
} catch (error) {
  console.log(`❌ Error reading package.json: ${error.message}`);
}

// Check build scripts
console.log('\n🔧 Build Scripts Check:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  const importantScripts = ['build', 'dev', 'start'];
  importantScripts.forEach(script => {
    if (scripts[script]) {
      console.log(`✅ ${script}: ${scripts[script]}`);
    } else {
      console.log(`❌ ${script}: MISSING`);
    }
  });
} catch (error) {
  console.log(`❌ Error checking scripts: ${error.message}`);
}

// Check TypeScript configuration
console.log('\n📝 TypeScript Configuration:');
try {
  if (fs.existsSync('tsconfig.json')) {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    console.log(`✅ Target: ${tsconfig.compilerOptions?.target || 'not set'}`);
    console.log(`✅ Module: ${tsconfig.compilerOptions?.module || 'not set'}`);
    console.log(`✅ JSX: ${tsconfig.compilerOptions?.jsx || 'not set'}`);
  }
  
  if (fs.existsSync('tsconfig.build.json')) {
    console.log('✅ tsconfig.build.json exists');
  } else {
    console.log('❌ tsconfig.build.json missing');
  }
} catch (error) {
  console.log(`❌ Error checking TypeScript config: ${error.message}`);
}

// Check Babel configuration
console.log('\n🔄 Babel Configuration:');
try {
  if (fs.existsSync('.babelrc')) {
    const babelrc = JSON.parse(fs.readFileSync('.babelrc', 'utf8'));
    console.log('✅ .babelrc exists');
    console.log(`Presets: ${JSON.stringify(babelrc.presets || [])}`);
    console.log(`Plugins: ${JSON.stringify(babelrc.plugins || [])}`);
  } else if (fs.existsSync('babel.config.js')) {
    console.log('✅ babel.config.js exists');
  } else {
    console.log('⚠️ No Babel configuration found');
  }
} catch (error) {
  console.log(`❌ Error checking Babel config: ${error.message}`);
}

// Check Next.js configuration
console.log('\n⚡ Next.js Configuration:');
try {
  if (fs.existsSync('next.config.js')) {
    console.log('✅ next.config.js exists');
    // Try to require it (basic syntax check)
    delete require.cache[path.resolve('next.config.js')];
    const nextConfig = require('./next.config.js');
    console.log(`✅ Configuration loads successfully`);
    console.log(`Output: ${nextConfig.output || 'default'}`);
    console.log(`Trailing slash: ${nextConfig.trailingSlash || false}`);
  } else {
    console.log('❌ next.config.js missing');
  }
} catch (error) {
  console.log(`❌ Error in next.config.js: ${error.message}`);
}

// Check source directory structure
console.log('\n📂 Source Directory Structure:');
const srcDirs = [
  'src/app',
  'src/components',
  'src/lib',
  'src/types',
  'src/styles'
];

srcDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      const files = fs.readdirSync(dir);
      console.log(`✅ ${dir} (${files.length} items)`);
    } catch (error) {
      console.log(`⚠️ ${dir} exists but cannot read`);
    }
  } else {
    console.log(`❌ ${dir} missing`);
  }
});

// Check for common problematic patterns
console.log('\n🚨 Common Issues Check:');

// Check for async/await in top level
const checkAsyncAwait = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('await ') && !content.includes('async function') && !content.includes('export async function')) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('await ') && !line.includes('//') && !line.includes('async')) {
          console.log(`⚠️ Potential top-level await in ${filePath}:${index + 1}`);
        }
      });
    }
  } catch (error) {
    // Ignore read errors
  }
};

checkAsyncAwait('src/lib/firebase.ts');

// Check for missing imports
const checkMissingImports = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    
    importLines.forEach((line, index) => {
      if (line.includes("from '@/") && !line.includes('//')) {
        const match = line.match(/from ['"]@\/([^'"]+)['"]/);
        if (match) {
          const importPath = `src/${match[1]}`;
          const possibleExtensions = ['', '.ts', '.tsx', '.js', '.jsx'];
          let found = false;
          
          for (const ext of possibleExtensions) {
            if (fs.existsSync(importPath + ext)) {
              found = true;
              break;
            }
          }
          
          if (!found) {
            console.log(`⚠️ Potential missing import in ${filePath}: ${importPath}`);
          }
        }
      }
    });
  } catch (error) {
    // Ignore read errors
  }
};

checkMissingImports('src/app/layout.tsx');
checkMissingImports('src/app/page.tsx');

console.log('\n✅ Debug analysis completed!');
console.log('✅ اكتمل تحليل التشخيص!');

console.log('\n💡 Next Steps:');
console.log('💡 الخطوات التالية:');
console.log('1. Fix any missing files or dependencies shown above');
console.log('2. Run: npm install');
console.log('3. Run: npm run build');
console.log('4. Check build output for specific errors');
console.log('1. أصلح أي ملفات أو تبعيات مفقودة ظاهرة أعلاه');
console.log('2. شغل: npm install');
console.log('3. شغل: npm run build');
console.log('4. تحقق من مخرجات البناء للأخطاء المحددة');
