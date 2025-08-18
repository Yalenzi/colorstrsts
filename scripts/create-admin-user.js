#!/usr/bin/env node

/**
 * إنشاء مستخدم مدير جديد في Firebase
 * Create new admin user in Firebase
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// تهيئة Firebase Admin SDK
function initializeFirebase() {
  try {
    // استخدام متغيرات البيئة أو القيم الافتراضية
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID || 'colorstests-573ef',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };

    // إذا لم تكن متغيرات البيئة متاحة، استخدم الإعدادات الافتراضية
    if (!serviceAccount.clientEmail || !serviceAccount.privateKey) {
      console.log('⚠️  Using default Firebase configuration...');
      // يمكن إضافة إعدادات افتراضية هنا إذا لزم الأمر
    }

    const app = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://colorstests-573ef-default-rtdb.firebaseio.com'
    });

    return {
      auth: getAuth(app),
      db: getFirestore(app)
    };
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    throw error;
  }
}

// إنشاء مستخدم مدير
async function createAdminUser(email, password, displayName) {
  try {
    const { auth, db } = initializeFirebase();
    
    console.log(`🔄 Creating admin user: ${email}`);
    
    // إنشاء المستخدم في Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: displayName,
        emailVerified: true
      });
      console.log(`✅ User created in Firebase Auth: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`ℹ️  User already exists, getting user record...`);
        userRecord = await auth.getUserByEmail(email);
        
        // تحديث كلمة المرور إذا لزم الأمر
        await auth.updateUser(userRecord.uid, {
          password: password,
          displayName: displayName,
          emailVerified: true
        });
        console.log(`✅ User updated: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // إنشاء ملف المستخدم في Firestore
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const userData = {
      email: email,
      displayName: displayName,
      role: 'super_admin',
      isActive: true,
      emailVerified: true,
      adminAccess: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      language: 'ar',
      securitySettings: {
        mfaEnabled: false,
        lastPasswordChange: new Date(),
        loginAttempts: 0,
        accountLocked: false
      },
      permissions: [
        'admin:all',
        'admin:users:read',
        'admin:users:write',
        'admin:users:delete',
        'admin:tests:read',
        'admin:tests:write',
        'admin:tests:delete',
        'admin:settings:read',
        'admin:settings:write',
        'admin:analytics:read',
        'admin:security:read',
        'admin:security:write'
      ],
      metadata: {
        createdBy: 'system',
        createdReason: 'admin_setup_script',
        lastLoginAt: null,
        loginCount: 0
      }
    };

    await userDocRef.set(userData);
    console.log(`✅ User profile created in Firestore`);

    // إضافة المستخدم إلى مجموعة المديرين
    const adminGroupRef = db.collection('adminGroups').doc('super_admins');
    const adminGroupDoc = await adminGroupRef.get();
    
    if (adminGroupDoc.exists()) {
      const currentMembers = adminGroupDoc.data().members || [];
      if (!currentMembers.includes(userRecord.uid)) {
        await adminGroupRef.update({
          members: [...currentMembers, userRecord.uid],
          updatedAt: new Date()
        });
      }
    } else {
      await adminGroupRef.set({
        name: 'Super Administrators',
        nameAr: 'المديرين الرئيسيين',
        description: 'Full system access',
        descriptionAr: 'وصول كامل للنظام',
        members: [userRecord.uid],
        permissions: ['admin:all'],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log(`✅ User added to admin group`);

    return {
      uid: userRecord.uid,
      email: email,
      displayName: displayName,
      success: true
    };

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

// إنشاء عدة مستخدمين مديرين
async function createMultipleAdmins() {
  const admins = [
    {
      email: 'aburakan4551@gmail.com',
      password: 'Aa@456005',
      displayName: 'Abu Rakan - Super Admin'
    },
    {
      email: 'admin@colorstest.com',
      password: 'ColorTest2025!Admin',
      displayName: 'System Administrator'
    },
    {
      email: 'admin_colorstest_com@gmail.com',
      password: 'AdminColors2025!',
      displayName: 'Admin Colors Test'
    }
  ];

  console.log('🚀 Starting admin users creation...\n');

  const results = [];
  for (const admin of admins) {
    try {
      const result = await createAdminUser(admin.email, admin.password, admin.displayName);
      results.push(result);
      console.log(`✅ Successfully created: ${admin.email}\n`);
    } catch (error) {
      console.error(`❌ Failed to create: ${admin.email}`);
      console.error(`   Error: ${error.message}\n`);
      results.push({
        email: admin.email,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

// تشغيل السكريبت
async function main() {
  try {
    console.log('🔧 Admin User Creation Script');
    console.log('============================\n');

    const results = await createMultipleAdmins();
    
    console.log('\n📊 Summary:');
    console.log('===========');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    if (successful.length > 0) {
      console.log('\n✅ Successfully created users:');
      successful.forEach(user => {
        console.log(`   - ${user.email} (${user.uid})`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed to create users:');
      failed.forEach(user => {
        console.log(`   - ${user.email}: ${user.error}`);
      });
    }

    console.log('\n🎉 Admin setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Test login with the created admin accounts');
    console.log('2. Verify admin access in the dashboard');
    console.log('3. Update any environment variables if needed');
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
    process.exit(1);
  }
}

// تشغيل السكريبت إذا تم استدعاؤه مباشرة
if (require.main === module) {
  main();
}

module.exports = {
  createAdminUser,
  createMultipleAdmins
};
