#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔧 Setting up Admin Account...\n');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Admin account details
const ADMIN_EMAIL = 'aburakan4551@gmail.com';
const ADMIN_PASSWORD = 'Aa@456005'; // This should be changed after first login
const ADMIN_DISPLAY_NAME = 'Super Admin';

async function setupAdminAccount() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('1. Checking if admin account exists...');
    
    let user;
    try {
      // Try to sign in first
      const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      user = userCredential.user;
      console.log('✅ Admin account already exists');
    } catch (signInError) {
      if (signInError.code === 'auth/user-not-found') {
        console.log('📝 Creating new admin account...');
        
        // Create new admin account
        const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        user = userCredential.user;
        console.log('✅ Admin account created successfully');
      } else {
        throw signInError;
      }
    }

    console.log('2. Setting up admin profile in Firestore...');
    
    // Check if admin profile exists
    const adminRef = doc(db, 'admins', user.uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      // Create admin profile
      const adminProfile = {
        uid: user.uid,
        email: ADMIN_EMAIL,
        displayName: ADMIN_DISPLAY_NAME,
        role: 'super_admin',
        permissions: [
          'manage_users',
          'manage_tests',
          'manage_content',
          'manage_settings',
          'view_analytics',
          'manage_admins',
          'system_config'
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(adminRef, adminProfile);
      console.log('✅ Admin profile created in Firestore');
    } else {
      console.log('✅ Admin profile already exists in Firestore');
    }

    console.log('3. Verifying admin setup...');
    
    // Verify the setup
    const verifyAdminSnap = await getDoc(adminRef);
    if (verifyAdminSnap.exists()) {
      const adminData = verifyAdminSnap.data();
      console.log('✅ Admin verification successful');
      console.log('📋 Admin Details:');
      console.log(`   - Email: ${adminData.email}`);
      console.log(`   - Role: ${adminData.role}`);
      console.log(`   - Permissions: ${adminData.permissions.length} permissions`);
      console.log(`   - Status: ${adminData.isActive ? 'Active' : 'Inactive'}`);
    } else {
      throw new Error('Admin profile verification failed');
    }

    console.log('\n🎉 Admin account setup completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Visit http://localhost:3000/ar/admin/login to test login');
    console.log('2. Use the following credentials:');
    console.log(`   - Email: ${ADMIN_EMAIL}`);
    console.log(`   - Password: ${ADMIN_PASSWORD}`);
    console.log('3. Change the password after first login for security');
    console.log('4. Test the admin panel functionality');

  } catch (error) {
    console.error('❌ Error setting up admin account:', error);
    
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          console.log('ℹ️ Admin email is already in use. This might be expected.');
          break;
        case 'auth/weak-password':
          console.log('⚠️ Password is too weak. Please use a stronger password.');
          break;
        case 'auth/invalid-email':
          console.log('⚠️ Invalid email format.');
          break;
        case 'auth/network-request-failed':
          console.log('⚠️ Network error. Check your internet connection.');
          break;
        default:
          console.log(`⚠️ Firebase Auth Error: ${error.code}`);
      }
    }
    
    process.exit(1);
  }
}

// Additional function to create test admin accounts
async function createTestAdmins() {
  const testAdmins = [
    {
      email: 'admin@colorstest.com',
      password: 'TestAdmin123!',
      displayName: 'Test Admin',
      role: 'admin'
    }
  ];

  console.log('\n🧪 Creating test admin accounts...');

  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    for (const admin of testAdmins) {
      try {
        console.log(`📝 Creating test admin: ${admin.email}`);
        
        const userCredential = await createUserWithEmailAndPassword(auth, admin.email, admin.password);
        const user = userCredential.user;

        // Create admin profile
        const adminProfile = {
          uid: user.uid,
          email: admin.email,
          displayName: admin.displayName,
          role: admin.role,
          permissions: [
            'manage_users',
            'manage_tests',
            'manage_content',
            'manage_settings',
            'view_analytics'
          ],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const adminRef = doc(db, 'admins', user.uid);
        await setDoc(adminRef, adminProfile);
        
        console.log(`✅ Test admin created: ${admin.email}`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`ℹ️ Test admin already exists: ${admin.email}`);
        } else {
          console.error(`❌ Error creating test admin ${admin.email}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error creating test admins:', error);
  }
}

// Run the setup
async function main() {
  await setupAdminAccount();
  
  // Ask if user wants to create test admins
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nDo you want to create test admin accounts? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      await createTestAdmins();
    }
    
    console.log('\n✅ Setup completed!');
    rl.close();
    process.exit(0);
  });
}

main().catch(console.error);
