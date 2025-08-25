#!/usr/bin/env node

/**
 * Validate Netlify Configuration Script
 * سكريبت التحقق من صحة إعدادات Netlify
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Netlify Configuration Validator');
console.log('🔍 أداة التحقق من إعدادات Netlify');
console.log('='.repeat(50));

// Check if netlify.toml exists
const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml');

console.log('\n📁 File Check:');
if (!fs.existsSync(netlifyTomlPath)) {
  console.log('❌ netlify.toml does not exist');
  process.exit(1);
}

console.log('✅ netlify.toml exists');

// Read and validate netlify.toml
console.log('\n📋 Configuration Analysis:');
try {
  const content = fs.readFileSync(netlifyTomlPath, 'utf8');
  
  // Basic syntax checks
  console.log(`✅ File size: ${content.length} characters`);
  console.log(`✅ Lines: ${content.split('\n').length}`);
  
  // Check for common issues
  const issues = [];
  
  // Check for duplicate sections
  const sections = content.match(/^\[([^\]]+)\]/gm) || [];
  const sectionCounts = {};
  
  sections.forEach(section => {
    const cleanSection = section.replace(/^\[|\]$/g, '');
    sectionCounts[cleanSection] = (sectionCounts[cleanSection] || 0) + 1;
  });
  
  console.log('\n🔍 Section Analysis:');
  for (const [section, count] of Object.entries(sectionCounts)) {
    if (count > 1) {
      console.log(`⚠️ Duplicate section: [${section}] (${count} times)`);
      issues.push(`Duplicate section: [${section}]`);
    } else {
      console.log(`✅ [${section}]`);
    }
  }
  
  // Check for required sections
  const requiredSections = ['build'];
  console.log('\n🔍 Required Sections Check:');
  
  requiredSections.forEach(section => {
    if (sectionCounts[section]) {
      console.log(`✅ [${section}] section present`);
    } else {
      console.log(`❌ [${section}] section missing`);
      issues.push(`Missing required section: [${section}]`);
    }
  });
  
  // Check build configuration
  console.log('\n🔍 Build Configuration Check:');
  
  if (content.includes('command =')) {
    const commandMatch = content.match(/command\s*=\s*"([^"]+)"/);
    if (commandMatch) {
      console.log(`✅ Build command: ${commandMatch[1]}`);
    } else {
      console.log('⚠️ Build command format issue');
      issues.push('Build command format issue');
    }
  } else {
    console.log('❌ No build command specified');
    issues.push('No build command specified');
  }
  
  if (content.includes('publish =')) {
    const publishMatch = content.match(/publish\s*=\s*"([^"]+)"/);
    if (publishMatch) {
      console.log(`✅ Publish directory: ${publishMatch[1]}`);
    } else {
      console.log('⚠️ Publish directory format issue');
      issues.push('Publish directory format issue');
    }
  } else {
    console.log('❌ No publish directory specified');
    issues.push('No publish directory specified');
  }
  
  // Check environment variables
  console.log('\n🔍 Environment Variables Check:');
  
  const envVars = content.match(/^\s*([A-Z_]+)\s*=\s*"([^"]+)"/gm) || [];
  console.log(`✅ Found ${envVars.length} environment variables`);
  
  // Check for important env vars
  const importantEnvVars = ['NODE_VERSION', 'NPM_VERSION', 'NODE_ENV'];
  importantEnvVars.forEach(envVar => {
    if (content.includes(`${envVar} =`)) {
      const match = content.match(new RegExp(`${envVar}\\s*=\\s*"([^"]+)"`));
      if (match) {
        console.log(`✅ ${envVar}: ${match[1]}`);
      }
    } else {
      console.log(`⚠️ ${envVar} not set`);
    }
  });
  
  // Check for syntax issues
  console.log('\n🔍 Syntax Check:');
  
  // Check for unmatched quotes
  const quotes = content.match(/"/g) || [];
  if (quotes.length % 2 !== 0) {
    console.log('⚠️ Unmatched quotes detected');
    issues.push('Unmatched quotes');
  } else {
    console.log('✅ Quotes are balanced');
  }
  
  // Check for unmatched brackets
  const openBrackets = (content.match(/\[/g) || []).length;
  const closeBrackets = (content.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    console.log('⚠️ Unmatched brackets detected');
    issues.push('Unmatched brackets');
  } else {
    console.log('✅ Brackets are balanced');
  }
  
  // Summary
  console.log('\n📊 Validation Summary:');
  if (issues.length === 0) {
    console.log('✅ netlify.toml is valid!');
    console.log('✅ ملف netlify.toml صحيح!');
  } else {
    console.log(`⚠️ Found ${issues.length} issues:`);
    console.log(`⚠️ تم العثور على ${issues.length} مشاكل:`);
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  }
  
} catch (error) {
  console.log(`❌ Error reading netlify.toml: ${error.message}`);
  process.exit(1);
}

console.log('\n💡 Tips for fixing issues:');
console.log('💡 نصائح لإصلاح المشاكل:');
console.log('1. Remove duplicate sections');
console.log('2. Ensure all quotes are properly closed');
console.log('3. Check bracket matching');
console.log('4. Validate TOML syntax online if needed');
console.log('1. احذف الأقسام المكررة');
console.log('2. تأكد من إغلاق جميع علامات الاقتباس');
console.log('3. تحقق من تطابق الأقواس');
console.log('4. تحقق من صحة TOML syntax عبر الإنترنت إذا لزم الأمر');

console.log('\n✅ Validation completed!');
console.log('✅ اكتمل التحقق!');
