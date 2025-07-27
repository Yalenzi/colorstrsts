import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// إعداد الإعدادات الافتراضية في Firebase
export async function initializeFirebaseSettings() {
  try {
    console.log('🔧 Initializing Firebase settings...');
    
    // إعدادات المحتوى الافتراضية
    const contentSettingsRef = doc(db, 'settings', 'content');
    const contentSettingsDoc = await getDoc(contentSettingsRef);
    
    if (!contentSettingsDoc.exists()) {
      console.log('📝 Creating default content settings...');
      await setDoc(contentSettingsRef, {
        freeTestsEnabled: true,
        freeTestsLimit: 3,
        premiumTestsEnabled: true,
        premiumPrice: 10,
        currency: 'SAR',
        freeTestsList: [0, 1, 2], // First 3 tests are free
        subscriptionPlans: {
          monthly: {
            enabled: true,
            price: 29,
            testsLimit: 50
          },
          yearly: {
            enabled: true,
            price: 299,
            testsLimit: 1000
          },
          unlimited: {
            enabled: true,
            price: 499
          }
        },
        paymentMethods: {
          stcPay: true,
          creditCard: false,
          applePay: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Content settings created');
    } else {
      console.log('✅ Content settings already exist');
    }

    // إعدادات النظام الافتراضية
    const systemSettingsRef = doc(db, 'settings', 'system');
    const systemSettingsDoc = await getDoc(systemSettingsRef);
    
    if (!systemSettingsDoc.exists()) {
      console.log('📝 Creating default system settings...');
      await setDoc(systemSettingsRef, {
        globalFreeAccess: false,
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: true,
        maxTestsPerDay: 10,
        sessionTimeout: 3600, // 1 hour
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('✅ System settings created');
    } else {
      console.log('✅ System settings already exist');
    }

    // تحديث localStorage مع الإعدادات الجديدة
    const contentSettings = contentSettingsDoc.exists() ? contentSettingsDoc.data() : null;
    if (contentSettings) {
      localStorage.setItem('content_settings', JSON.stringify(contentSettings));
      console.log('💾 Content settings cached locally');
    }

    console.log('🎉 Firebase settings initialization complete');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Firebase settings:', error);
    return false;
  }
}

// إنشاء مستخدم مدير افتراضي
export async function createDefaultAdminUser() {
  try {
    console.log('👤 Checking for admin users...');
    
    const adminEmails = [
      'aburakan4551@gmail.com',
      'admin@colorstest.com'
    ];

    for (const email of adminEmails) {
      // إنشاء مستند مستخدم افتراضي للمدير
      const userRef = doc(db, 'users', email.replace('@', '_').replace('.', '_'));
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log(`📝 Creating admin user: ${email}`);
        await setDoc(userRef, {
          email: email,
          displayName: email.split('@')[0],
          role: 'super_admin',
          status: 'active',
          emailVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          testsCount: 0,
          freeTestsUsed: 0,
          profile: {
            firstName: 'Admin',
            lastName: 'User',
          },
          subscription: {
            plan: 'unlimited',
            status: 'active',
            startDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
            testsUsed: 0,
            testsLimit: -1 // Unlimited
          }
        });
        console.log(`✅ Admin user created: ${email}`);
      } else {
        console.log(`✅ Admin user already exists: ${email}`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Error creating admin users:', error);
    return false;
  }
}

// تهيئة شاملة للنظام
export async function initializeSystem() {
  console.log('🚀 Starting system initialization...');
  
  const settingsResult = await initializeFirebaseSettings();
  const adminResult = await createDefaultAdminUser();
  
  if (settingsResult && adminResult) {
    console.log('🎉 System initialization completed successfully');
    
    // إرسال حدث لتحديث المكونات
    window.dispatchEvent(new CustomEvent('systemInitialized', {
      detail: { success: true }
    }));
    
    return true;
  } else {
    console.error('❌ System initialization failed');
    return false;
  }
}

// فحص حالة النظام
export async function checkSystemHealth() {
  try {
    console.log('🔍 Checking system health...');
    
    // فحص الاتصال بـ Firebase
    const testRef = doc(db, 'health', 'check');
    await setDoc(testRef, {
      timestamp: new Date().toISOString(),
      status: 'healthy'
    });
    
    // فحص الإعدادات
    const contentSettingsRef = doc(db, 'settings', 'content');
    const contentSettingsDoc = await getDoc(contentSettingsRef);
    
    const systemHealth = {
      firebase: true,
      contentSettings: contentSettingsDoc.exists(),
      timestamp: new Date().toISOString()
    };
    
    console.log('💚 System health check passed:', systemHealth);
    return systemHealth;
  } catch (error) {
    console.error('❤️‍🩹 System health check failed:', error);
    return {
      firebase: false,
      contentSettings: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
