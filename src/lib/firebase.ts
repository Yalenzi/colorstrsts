// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
// Analytics removed to avoid build issues
// import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

// Firebase configuration from environment variables
// إعداد Firebase من متغيرات البيئة

// Get Firebase configuration from environment variables or fallback to defaults
// الحصول على إعداد Firebase من متغيرات البيئة أو استخدام القيم الافتراضية
const getFirebaseConfig = () => {
  // Always try to use environment variables first
  const hasEnvVars = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (hasEnvVars) {
    // Use environment variables when available
    console.log('🔧 Using Firebase config from environment variables');
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
  } else {
    // Fallback configuration for static export or when env vars are not available
    // إعداد احتياطي للتصدير الثابت أو عندما متغيرات البيئة غير متاحة
    console.log('⚠️ Using fallback Firebase config');
    return {
      apiKey: "AIzaSyBCTEmastiOgvmTDu1EHxA0bkDAws00bIU",
      authDomain: "colorstest.com", // استخدام النطاق المخصص
      databaseURL: "https://colorstests-573ef-default-rtdb.firebaseio.com",
      projectId: "colorstests-573ef",
      storageBucket: "colorstests-573ef.firebasestorage.app",
      messagingSenderId: "94361461929",
      appId: "1:94361461929:web:b34ad287c782710415f5b8"
    };
  }
};

const firebaseConfig = getFirebaseConfig();

// Validate Firebase configuration
// التحقق من صحة إعداد Firebase
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is incomplete');
  console.error('Missing required fields:', {
    apiKey: !firebaseConfig.apiKey ? 'MISSING' : 'OK',
    projectId: !firebaseConfig.projectId ? 'MISSING' : 'OK',
    authDomain: !firebaseConfig.authDomain ? 'MISSING' : 'OK'
  });
  console.error('Please check your Firebase configuration in .env.local');
} else {
  console.log('✅ Firebase configuration is valid');
  console.log('🔧 Firebase Project:', firebaseConfig.projectId);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Realtime Database and get a reference to the service with error handling
let database: any = null;
try {
  database = getDatabase(app);
  console.log('✅ Firebase Realtime Database initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Realtime Database:', error);
  console.error('Database URL:', firebaseConfig.databaseURL);
  console.error('Please ensure that you have the URL of your Firebase Realtime Database instance configured correctly.');
}

export { database };

// Analytics temporarily disabled to avoid build issues
// Initialize Analytics (optional, only in browser) - only if measurement ID is provided and supported
// تهيئة Analytics (اختياري، فقط في المتصفح) - فقط إذا تم توفير معرف القياس ومدعوم
export const analytics = null;

// Function to initialize analytics when needed (disabled for now)
export const initializeAnalytics = () => {
  console.log('⚠️ Firebase Analytics is disabled to avoid build issues');
  return Promise.resolve(null);
};

export default app;
