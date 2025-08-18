#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Firebase Production Authentication Fix');
console.log('=========================================\n');

// Production domain configuration
const PRODUCTION_DOMAINS = [
  'colorstest.com',
  'www.colorstest.com'
];

const FIREBASE_PROJECT_ID = 'colorstests-573ef';
const FIREBASE_AUTH_DOMAIN = 'colorstests-573ef.firebaseapp.com';

// Generate Firebase Console URLs
function generateFirebaseUrls() {
  return {
    authSettings: `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`,
    authProviders: `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`,
    projectSettings: `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/settings/general`
  };
}

// Generate Google Cloud Console URLs
function generateGoogleCloudUrls() {
  return {
    credentials: `https://console.cloud.google.com/apis/credentials?project=${FIREBASE_PROJECT_ID}`,
    oauth: `https://console.cloud.google.com/apis/credentials/oauthclient?project=${FIREBASE_PROJECT_ID}`
  };
}

// Check current Firebase configuration
function checkFirebaseConfig() {
  console.log('1. Checking Firebase Configuration...');
  console.log('====================================');
  
  try {
    const firebaseConfigPath = path.join(__dirname, '../src/lib/firebase.ts');
    const content = fs.readFileSync(firebaseConfigPath, 'utf8');
    
    // Extract configuration values
    const authDomainMatch = content.match(/authDomain:\s*["']([^"']+)["']/);
    const projectIdMatch = content.match(/projectId:\s*["']([^"']+)["']/);
    
    if (authDomainMatch && projectIdMatch) {
      console.log(`✅ Firebase Project ID: ${projectIdMatch[1]}`);
      console.log(`✅ Firebase Auth Domain: ${authDomainMatch[1]}`);
      
      if (projectIdMatch[1] === FIREBASE_PROJECT_ID) {
        console.log('✅ Project ID matches expected value');
      } else {
        console.log(`⚠️ Project ID mismatch. Expected: ${FIREBASE_PROJECT_ID}`);
      }
      
      return true;
    } else {
      console.log('❌ Could not extract Firebase configuration');
      return false;
    }
  } catch (error) {
    console.log('❌ Error reading Firebase configuration:', error.message);
    return false;
  }
}

// Generate step-by-step instructions
function generateInstructions() {
  console.log('\n2. Required Actions for Production Fix:');
  console.log('======================================');
  
  const firebaseUrls = generateFirebaseUrls();
  const googleCloudUrls = generateGoogleCloudUrls();
  
  console.log('\n🔥 STEP 1: Update Firebase Authorized Domains');
  console.log('---------------------------------------------');
  console.log(`1. Open: ${firebaseUrls.authSettings}`);
  console.log('2. Scroll down to "Authorized domains" section');
  console.log('3. Click "Add domain" and add the following domains:');
  
  PRODUCTION_DOMAINS.forEach(domain => {
    console.log(`   ✅ ${domain}`);
  });
  
  console.log('\n🔧 STEP 2: Update Google Cloud OAuth Settings');
  console.log('---------------------------------------------');
  console.log(`1. Open: ${googleCloudUrls.credentials}`);
  console.log('2. Find your OAuth 2.0 Client ID (Web application)');
  console.log('3. Click "Edit" (pencil icon)');
  console.log('4. Add to "Authorized JavaScript origins":');
  
  PRODUCTION_DOMAINS.forEach(domain => {
    console.log(`   ✅ https://${domain}`);
  });
  
  console.log('5. Add to "Authorized redirect URIs":');
  console.log(`   ✅ https://${FIREBASE_AUTH_DOMAIN}/__/auth/handler`);
  
  PRODUCTION_DOMAINS.forEach(domain => {
    console.log(`   ✅ https://${domain}/__/auth/handler`);
  });
  
  console.log('\n🧪 STEP 3: Test the Fix');
  console.log('----------------------');
  console.log('1. Wait 5-10 minutes for changes to propagate');
  console.log('2. Visit your production site:');
  
  PRODUCTION_DOMAINS.forEach(domain => {
    console.log(`   🌐 https://${domain}`);
  });
  
  console.log('3. Try Google Sign-In');
  console.log('4. Check browser console for any remaining errors');
}

// Generate troubleshooting guide
function generateTroubleshooting() {
  console.log('\n3. Troubleshooting Guide:');
  console.log('========================');
  
  console.log('\n❌ If you still get "auth/internal-error":');
  console.log('  • Double-check all domains are added correctly');
  console.log('  • Ensure no typos in domain names');
  console.log('  • Wait up to 10 minutes for changes to propagate');
  console.log('  • Clear browser cache and cookies');
  console.log('  • Try incognito/private browsing mode');
  
  console.log('\n❌ If you get "auth/unauthorized-domain":');
  console.log('  • The domain is definitely not in authorized domains');
  console.log('  • Check Firebase Console authorized domains list');
  console.log('  • Ensure you\'re editing the correct Firebase project');
  
  console.log('\n❌ If popup is blocked:');
  console.log('  • The system automatically falls back to redirect');
  console.log('  • Users can manually allow popups in browser settings');
  console.log('  • Redirect method should work without popups');
  
  console.log('\n✅ Success indicators:');
  console.log('  • No console errors during sign-in');
  console.log('  • User successfully redirected after authentication');
  console.log('  • User profile data is saved correctly');
}

// Create a summary file
function createSummaryFile() {
  const summaryContent = `# Firebase Production Authentication Fix Summary

## Issue
- Website: https://colorstest.com
- Error: "auth/internal-error" during Google OAuth popup
- Cause: Production domain not in Firebase authorized domains

## Required Actions

### 1. Firebase Console - Authorized Domains
URL: https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings

Add these domains:
${PRODUCTION_DOMAINS.map(domain => `- ${domain}`).join('\n')}

### 2. Google Cloud Console - OAuth Settings  
URL: https://console.cloud.google.com/apis/credentials?project=${FIREBASE_PROJECT_ID}

**Authorized JavaScript origins:**
${PRODUCTION_DOMAINS.map(domain => `- https://${domain}`).join('\n')}

**Authorized redirect URIs:**
- https://${FIREBASE_AUTH_DOMAIN}/__/auth/handler
${PRODUCTION_DOMAINS.map(domain => `- https://${domain}/__/auth/handler`).join('\n')}

## Testing
1. Wait 5-10 minutes after making changes
2. Test Google Sign-In on production site
3. Check browser console for errors
4. Verify user data is saved correctly

## Fallback Mechanism
- System automatically uses redirect if popup fails
- Users will be redirected to Google for authentication
- After authentication, users return to the site

## Status
- [x] Identified issue
- [x] Created fix instructions  
- [ ] Updated Firebase authorized domains
- [ ] Updated Google Cloud OAuth settings
- [ ] Tested on production site

Generated: ${new Date().toISOString()}
`;

  const summaryPath = path.join(__dirname, '../PRODUCTION_AUTH_FIX.md');
  fs.writeFileSync(summaryPath, summaryContent);
  console.log(`\n📄 Summary file created: ${summaryPath}`);
}

// Main execution
function main() {
  console.log('🚀 Starting Firebase Production Authentication Fix...\n');
  
  // Check configuration
  const configOk = checkFirebaseConfig();
  
  if (!configOk) {
    console.log('\n❌ Firebase configuration check failed!');
    console.log('Please ensure Firebase is properly configured before proceeding.');
    process.exit(1);
  }
  
  // Generate instructions
  generateInstructions();
  
  // Generate troubleshooting guide
  generateTroubleshooting();
  
  // Create summary file
  createSummaryFile();
  
  console.log('\n🎉 Fix instructions generated successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Follow the instructions above');
  console.log('2. Test on production site after changes');
  console.log('3. Check PRODUCTION_AUTH_FIX.md for detailed summary');
  
  console.log('\n⚠️ IMPORTANT:');
  console.log('- Changes may take 5-10 minutes to propagate');
  console.log('- Test in incognito mode to avoid cache issues');
  console.log('- The fallback redirect mechanism should work immediately');
}

// Run the script
main();
