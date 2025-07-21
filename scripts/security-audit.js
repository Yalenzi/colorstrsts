#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔒 Security Audit - فحص الأمان الشامل');
console.log('='.repeat(50));

let securityScore = 0;
let totalChecks = 0;
const vulnerabilities = [];
const recommendations = [];

// فحص 1: ملفات البيئة الحساسة
console.log('\n📋 Environment Security Check...');
totalChecks++;

const sensitiveEnvVars = [
  'API_KEY', 'SECRET', 'PASSWORD', 'TOKEN', 'PRIVATE_KEY'
];

const envFiles = ['.env', '.env.local', '.env.production'];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    sensitiveEnvVars.forEach(varName => {
      if (content.includes(varName) && !content.includes(`${varName}=your_`)) {
        console.log(`⚠️ Sensitive variable found in ${file}: ${varName}`);
      }
    });
  }
});

// فحص 2: أذونات الملفات
console.log('\n📋 File Permissions Check...');
totalChecks++;

const criticalFiles = [
  'package.json', 'next.config.js', 'middleware.ts'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const mode = stats.mode & parseInt('777', 8);
    if (mode > parseInt('644', 8)) {
      vulnerabilities.push(`File ${file} has overly permissive permissions`);
    } else {
      securityScore++;
    }
  }
});

// فحص 3: Dependencies الضعيفة
console.log('\n📋 Dependencies Security Check...');
totalChecks++;

if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // قائمة المكتبات المعروفة بالثغرات
  const vulnerablePackages = [
    'lodash', 'moment', 'request', 'node-uuid'
  ];
  
  vulnerablePackages.forEach(pkg => {
    if (dependencies[pkg]) {
      vulnerabilities.push(`Potentially vulnerable package: ${pkg}`);
    }
  });
  
  securityScore++;
}

// فحص 4: إعدادات Next.js الأمنية
console.log('\n📋 Next.js Security Configuration...');
totalChecks++;

if (fs.existsSync('next.config.js')) {
  const configContent = fs.readFileSync('next.config.js', 'utf8');
  
  if (configContent.includes('headers()')) {
    console.log('✅ Security headers configured');
    securityScore++;
  } else {
    vulnerabilities.push('Missing security headers in next.config.js');
    recommendations.push('Add security headers to next.config.js');
  }
} else {
  vulnerabilities.push('next.config.js not found');
}

// فحص 5: Middleware الأمني
console.log('\n📋 Security Middleware Check...');
totalChecks++;

if (fs.existsSync('src/middleware.ts')) {
  const middlewareContent = fs.readFileSync('src/middleware.ts', 'utf8');
  
  const securityFeatures = [
    'rate limit', 'CSRF', 'XSS', 'IP blocking'
  ];
  
  securityFeatures.forEach(feature => {
    if (middlewareContent.toLowerCase().includes(feature.toLowerCase().replace(' ', ''))) {
      console.log(`✅ ${feature} protection found`);
    } else {
      recommendations.push(`Add ${feature} protection to middleware`);
    }
  });
  
  securityScore++;
} else {
  vulnerabilities.push('Security middleware not found');
}

// فحص 6: تشفير البيانات الحساسة
console.log('\n📋 Data Encryption Check...');
totalChecks++;

const srcFiles = getAllFiles('src', ['.ts', '.tsx']);
let encryptionFound = false;

srcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('encrypt') || content.includes('CryptoJS') || content.includes('crypto')) {
    encryptionFound = true;
  }
});

if (encryptionFound) {
  console.log('✅ Encryption implementation found');
  securityScore++;
} else {
  vulnerabilities.push('No encryption implementation found');
  recommendations.push('Implement data encryption for sensitive information');
}

// فحص 7: Input Validation
console.log('\n📋 Input Validation Check...');
totalChecks++;

let validationFound = false;
srcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('sanitize') || content.includes('validate') || content.includes('escape')) {
    validationFound = true;
  }
});

if (validationFound) {
  console.log('✅ Input validation found');
  securityScore++;
} else {
  vulnerabilities.push('Insufficient input validation');
  recommendations.push('Implement comprehensive input validation');
}

// النتائج النهائية
console.log('\n' + '='.repeat(50));
console.log('🔒 SECURITY AUDIT RESULTS / نتائج فحص الأمان');
console.log('='.repeat(50));

const scorePercentage = Math.round((securityScore / totalChecks) * 100);
console.log(`📊 Security Score: ${securityScore}/${totalChecks} (${scorePercentage}%)`);

if (scorePercentage >= 80) {
  console.log('✅ Security Status: GOOD / حالة الأمان: جيدة');
} else if (scorePercentage >= 60) {
  console.log('⚠️ Security Status: MODERATE / حالة الأمان: متوسطة');
} else {
  console.log('❌ Security Status: POOR / حالة الأمان: ضعيفة');
}

if (vulnerabilities.length > 0) {
  console.log('\n🚨 VULNERABILITIES FOUND:');
  vulnerabilities.forEach((vuln, index) => {
    console.log(`${index + 1}. ${vuln}`);
  });
}

if (recommendations.length > 0) {
  console.log('\n💡 SECURITY RECOMMENDATIONS:');
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
}

// Helper function
function getAllFiles(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

console.log('\n🔒 Security audit completed!');