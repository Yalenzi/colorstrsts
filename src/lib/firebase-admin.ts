import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// تهيئة Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();

// وظائف إدارة الاشتراكات مع صلاحيات Admin
export async function updateSubscriptionWithAdmin(subscriptionId: string, data: any) {
  try {
    const docRef = adminDb.collection('stc_subscriptions').doc(subscriptionId);
    await docRef.set(data, { merge: true });
    console.log('✅ Admin subscription update successful');
    return true;
  } catch (error) {
    console.error('❌ Admin subscription update failed:', error);
    throw error;
  }
}

export async function getAllSubscriptionsAdmin() {
  try {
    const snapshot = await adminDb.collection('stc_subscriptions').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error getting subscriptions:', error);
    return [];
  }
}