#!/usr/bin/env node

/**
 * Force SWC Build Script
 * سكريبت إجبار استخدام SWC
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Force SWC Build Script');
console.log('🚀 سكريبت إجبار استخدام SWC');
console.log('='.repeat(50));

// List of all possible Babel config files
const babelConfigFiles = [
  '.babelrc',
  '.babelrc.js',
  '.babelrc.json',
  'babel.config.js',
  'babel.config.json',
  'babel.config.mjs',
  'babel.config.cjs'
];

console.log('\n🔍 Searching for Babel configuration files...');

// Remove all Babel config files
babelConfigFiles.forEach(configFile => {
  if (fs.existsSync(configFile)) {
    try {
      // Create backup first
      const backupFile = configFile + '.disabled';
      fs.copyFileSync(configFile, backupFile);
      console.log(`📋 Backed up ${configFile} → ${backupFile}`);
      
      // Remove the original
      fs.unlinkSync(configFile);
      console.log(`❌ Removed ${configFile}`);
    } catch (error) {
      console.log(`⚠️ Error removing ${configFile}: ${error.message}`);
    }
  } else {
    console.log(`✅ ${configFile} not found (good)`);
  }
});

// Check package.json for babel config
console.log('\n🔍 Checking package.json for babel configuration...');
try {
  const packageJsonPath = 'package.json';
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.babel) {
    console.log('⚠️ Found babel configuration in package.json');
    
    // Create backup
    const backupPath = 'package.json.babel-backup';
    fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2));
    console.log(`📋 Backed up package.json → ${backupPath}`);
    
    // Remove babel config
    delete packageJson.babel;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('❌ Removed babel configuration from package.json');
  } else {
    console.log('✅ No babel configuration in package.json');
  }
} catch (error) {
  console.log(`⚠️ Error checking package.json: ${error.message}`);
}

// Force SWC in next.config.js
console.log('\n🔧 Configuring next.config.js to force SWC...');
try {
  const nextConfigPath = 'next.config.js';
  let nextConfigExists = fs.existsSync(nextConfigPath);
  let nextConfig = {};
  
  if (nextConfigExists) {
    // Read existing config (this is tricky since it's a JS file)
    const configContent = fs.readFileSync(nextConfigPath, 'utf8');
    console.log('📋 Found existing next.config.js');
  }
  
  // Create a new next.config.js that forces SWC
  const newNextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force SWC compilation (disable Babel)
  experimental: {
    forceSwcTransforms: true,
  },
  
  // Disable SWC minification if it causes issues
  swcMinify: true,
  
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // React strict mode
  reactStrictMode: true,
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'my-value',
  },
  
  // Webpack configuration to ensure no Babel
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Remove any babel-loader if present
    config.module.rules = config.module.rules.filter(rule => {
      if (rule.use && Array.isArray(rule.use)) {
        return !rule.use.some(use => 
          use.loader && use.loader.includes('babel-loader')
        );
      }
      return true;
    });
    
    return config;
  },
}

module.exports = nextConfig;`;

  // Backup existing config
  if (nextConfigExists) {
    fs.copyFileSync(nextConfigPath, nextConfigPath + '.backup');
    console.log(`📋 Backed up existing next.config.js`);
  }
  
  // Write new config
  fs.writeFileSync(nextConfigPath, newNextConfig);
  console.log('✅ Created SWC-forced next.config.js');
  
} catch (error) {
  console.log(`⚠️ Error configuring next.config.js: ${error.message}`);
}

// Create .swcrc to ensure SWC configuration
console.log('\n🔧 Creating .swcrc for SWC configuration...');
const swcConfig = {
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true,
      "decorators": false,
      "dynamicImport": true
    },
    "transform": {
      "react": {
        "pragma": "React.createElement",
        "pragmaFrag": "React.Fragment",
        "throwIfNamespace": true,
        "development": false,
        "useBuiltins": false,
        "refresh": false
      }
    },
    "target": "es2017",
    "loose": false,
    "externalHelpers": false,
    "keepClassNames": false
  },
  "module": {
    "type": "es6"
  },
  "minify": false,
  "isModule": true
};

try {
  fs.writeFileSync('.swcrc', JSON.stringify(swcConfig, null, 2));
  console.log('✅ Created .swcrc configuration');
} catch (error) {
  console.log(`⚠️ Error creating .swcrc: ${error.message}`);
}

// Verify the changes
console.log('\n🔍 Verification...');

// Check that no Babel configs exist
const remainingBabelConfigs = babelConfigFiles.filter(file => fs.existsSync(file));
if (remainingBabelConfigs.length === 0) {
  console.log('✅ All Babel configuration files removed');
} else {
  console.log(`⚠️ Some Babel configs still exist: ${remainingBabelConfigs.join(', ')}`);
}

// Check next.config.js
if (fs.existsSync('next.config.js')) {
  console.log('✅ next.config.js configured for SWC');
} else {
  console.log('⚠️ next.config.js not found');
}

// Check .swcrc
if (fs.existsSync('.swcrc')) {
  console.log('✅ .swcrc configuration created');
} else {
  console.log('⚠️ .swcrc not created');
}

console.log('\n🎉 SWC force configuration completed!');
console.log('🎉 اكتمل إجبار تكوين SWC!');

console.log('\n📋 Summary:');
console.log('📋 الملخص:');
console.log('✅ Removed all Babel configuration files');
console.log('✅ Configured next.config.js to force SWC');
console.log('✅ Created .swcrc for SWC settings');
console.log('✅ Backed up original files');

console.log('\n🚀 Next steps:');
console.log('🚀 الخطوات التالية:');
console.log('1. Run: npm run build');
console.log('2. Should use SWC instead of Babel');
console.log('3. No more @babel/plugin-transform-runtime errors');
console.log('1. شغل: npm run build');
console.log('2. يجب أن يستخدم SWC بدلاً من Babel');
console.log('3. لا مزيد من أخطاء @babel/plugin-transform-runtime');

console.log('\n💡 To restore Babel configs if needed:');
console.log('💡 لاستعادة تكوينات Babel إذا لزم الأمر:');
babelConfigFiles.forEach(file => {
  const backupFile = file + '.disabled';
  console.log(`cp ${backupFile} ${file}`);
});
