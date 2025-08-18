#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔧 Testing Authentication System...\n');

// Test Firebase Configuration
console.log('1. Testing Firebase Configuration:');
console.log('================================');

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

let configValid = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    configValid = false;
  }
});

if (!configValid) {
  console.log('\n❌ Firebase configuration is incomplete!');
  console.log('Please check your .env.local file.');
  process.exit(1);
}

// Test Firebase Initialization
console.log('\n2. Testing Firebase Initialization:');
console.log('===================================');

try {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');

  const auth = getAuth(app);
  console.log('✅ Firebase Auth initialized successfully');

  const db = getFirestore(app);
  console.log('✅ Firestore initialized successfully');

} catch (error) {
  console.log('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

// Test Google OAuth Configuration
console.log('\n3. Google OAuth Configuration Check:');
console.log('====================================');

const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

console.log(`📋 Project ID: ${projectId}`);
console.log(`📋 Auth Domain: ${authDomain}`);
console.log('\n📝 Required Google Console Settings:');
console.log('   - Authorized JavaScript origins:');
console.log('     • http://localhost:3000');
console.log('     • https://your-domain.com');
console.log('   - Authorized redirect URIs:');
console.log(`     • https://${authDomain}/__/auth/handler`);
console.log('     • http://localhost:3000');
console.log('     • https://your-domain.com');

// Test Network Connectivity
console.log('\n4. Testing Network Connectivity:');
console.log('================================');

const testUrls = [
  `https://${authDomain}`,
  'https://accounts.google.com',
  'https://firebase.googleapis.com'
];

async function testConnectivity() {
  for (const url of testUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ ${url}: Reachable`);
      } else {
        console.log(`⚠️ ${url}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${url}: ${error.message}`);
    }
  }
}

// Run connectivity test
testConnectivity().then(() => {
  console.log('\n🎉 Authentication system test completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Visit http://localhost:3000/ar/debug/auth-test to test the UI');
  console.log('2. Check Google Console OAuth settings');
  console.log('3. Test Google Sign-In functionality');
  console.log('4. Verify user data is saved to Firestore');
}).catch(error => {
  console.log('\n❌ Connectivity test failed:', error.message);
});

// Export for use in other scripts
module.exports = {
  testFirebaseConfig: () => configValid,
  getFirebaseConfig: () => ({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  })
};
