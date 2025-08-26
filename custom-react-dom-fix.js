#!/usr/bin/env node

console.log('🔧 Custom react-dom/client Fix for Next.js 13');
console.log('🔧 إصلاح مخصص لـ react-dom/client مع Next.js 13');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Step 1: Complete cleanup
console.log('\n🧹 Step 1: Complete cleanup...');
console.log('🧹 الخطوة 1: تنظيف شامل...');

try {
  // Remove node_modules
  if (fs.existsSync('node_modules')) {
    console.log('🗑️ Removing node_modules...');
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  
  // Remove package-lock.json
  if (fs.existsSync('package-lock.json')) {
    console.log('🗑️ Removing package-lock.json...');
    fs.unlinkSync('package-lock.json');
  }
  
  // Remove .next cache
  if (fs.existsSync('.next')) {
    console.log('🗑️ Removing .next cache...');
    execSync('rm -rf .next', { stdio: 'inherit' });
  }
  
  console.log('✅ Cleanup completed');
  console.log('✅ اكتمل التنظيف');
  
} catch (error) {
  console.log(`⚠️ Cleanup warning: ${error.message}`);
}

// Step 2: Install exact versions
console.log('\n📦 Step 2: Installing exact versions...');
console.log('📦 الخطوة 2: تثبيت الإصدارات الدقيقة...');

try {
  // Install exact versions with --save-exact
  console.log('📥 Installing Next.js 13.5.6 + React 18.2.0...');
  execSync('npm install --save-exact next@13.5.6 react@18.2.0 react-dom@18.2.0', { stdio: 'inherit' });
  
  console.log('✅ Core packages installed');
  console.log('✅ تم تثبيت الحزم الأساسية');
  
} catch (error) {
  console.log(`❌ Failed to install core packages: ${error.message}`);
  process.exit(1);
}

// Step 3: Create react-dom/client polyfill
console.log('\n🔧 Step 3: Creating react-dom/client polyfill...');
console.log('🔧 الخطوة 3: إنشاء polyfill لـ react-dom/client...');

try {
  const reactDomPath = path.join('node_modules', 'react-dom');
  const clientPath = path.join(reactDomPath, 'client');
  
  // Create client directory if it doesn't exist
  if (!fs.existsSync(clientPath)) {
    fs.mkdirSync(clientPath, { recursive: true });
    console.log('📁 Created react-dom/client directory');
    console.log('📁 تم إنشاء مجلد react-dom/client');
  }
  
  // Create index.js polyfill
  const polyfillContent = `
// Polyfill for react-dom/client in Next.js 13
// إصلاح لـ react-dom/client في Next.js 13

const ReactDOM = require('react-dom');

// Export createRoot for compatibility
const createRoot = (container) => {
  return {
    render: (element) => {
      ReactDOM.render(element, container);
    },
    unmount: () => {
      ReactDOM.unmountComponentAtNode(container);
    }
  };
};

// Export hydrateRoot for compatibility
const hydrateRoot = (container, element) => {
  ReactDOM.hydrate(element, container);
  return {
    render: (newElement) => {
      ReactDOM.render(newElement, container);
    },
    unmount: () => {
      ReactDOM.unmountComponentAtNode(container);
    }
  };
};

module.exports = {
  createRoot,
  hydrateRoot
};
`;
  
  fs.writeFileSync(path.join(clientPath, 'index.js'), polyfillContent);
  console.log('✅ react-dom/client polyfill created');
  console.log('✅ تم إنشاء polyfill لـ react-dom/client');
  
} catch (error) {
  console.log(`⚠️ Polyfill creation warning: ${error.message}`);
}

// Step 4: Install all dependencies
console.log('\n📦 Step 4: Installing all dependencies...');
console.log('📦 الخطوة 4: تثبيت جميع التبعيات...');

try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ All dependencies installed');
  console.log('✅ تم تثبيت جميع التبعيات');
  
} catch (error) {
  console.log(`❌ Failed to install dependencies: ${error.message}`);
  process.exit(1);
}

// Step 5: Verify modules
console.log('\n🔍 Step 5: Verifying modules...');
console.log('🔍 الخطوة 5: التحقق من المودولات...');

try {
  require.resolve('react');
  console.log('✅ react is available');
  console.log('✅ react متاح');
} catch (error) {
  console.log('❌ react not found');
  console.log('❌ react غير موجود');
}

try {
  require.resolve('react-dom');
  console.log('✅ react-dom is available');
  console.log('✅ react-dom متاح');
} catch (error) {
  console.log('❌ react-dom not found');
  console.log('❌ react-dom غير موجود');
}

try {
  require.resolve('react-dom/client');
  console.log('✅ react-dom/client is available (polyfilled)');
  console.log('✅ react-dom/client متاح (مع polyfill)');
} catch (error) {
  console.log('❌ react-dom/client still not found');
  console.log('❌ react-dom/client ما زال غير موجود');
}

try {
  require.resolve('react/jsx-runtime');
  console.log('✅ react/jsx-runtime is available');
  console.log('✅ react/jsx-runtime متاح');
} catch (error) {
  console.log('⚠️ react/jsx-runtime not found');
  console.log('⚠️ react/jsx-runtime غير موجود');
}

console.log('\n🎉 Custom react-dom/client fix completed!');
console.log('🎉 اكتمل الإصلاح المخصص لـ react-dom/client!');
console.log('\n💡 Next.js 13.5.6 + React 18.2.0 + Custom Polyfill = Should Work!');
console.log('💡 Next.js 13.5.6 + React 18.2.0 + Polyfill مخصص = يجب أن يعمل!');
