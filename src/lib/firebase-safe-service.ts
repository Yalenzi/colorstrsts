// خدمة Firebase آمنة مع معالجة أخطاء شاملة
// Safe Firebase Service with Comprehensive Error Handling

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch,
  DocumentReference,
  CollectionReference
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TestResult {
  id?: string;
  userId: string;
  testId: string;
  testName: string;
  colorId: string;
  colorName?: string;
  confidence: number;
  notes?: string;
  duration?: number;
  timestamp: any; // serverTimestamp
  sessionId?: string;
}

interface SafeFirebaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fallbackUsed?: boolean;
}

class SafeFirebaseService {
  private isFirebaseAvailable(): boolean {
    try {
      return !!db && typeof db === 'object';
    } catch (error) {
      console.warn('🔥 Firebase not available:', error);
      return false;
    }
  }

  private async safeOperation<T>(
    operation: () => Promise<T>,
    fallback?: () => T,
    operationName: string = 'Firebase operation'
  ): Promise<SafeFirebaseResult<T>> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Firebase not available');
      }

      console.log(`🔄 Attempting ${operationName}...`);
      const result = await operation();
      console.log(`✅ ${operationName} successful`);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      console.error(`❌ ${operationName} failed:`, error);

      // محاولة استخدام fallback إذا كان متاحاً
      if (fallback) {
        try {
          const fallbackResult = fallback();
          console.log(`🔄 Using fallback for ${operationName}`);
          
          return {
            success: true,
            data: fallbackResult,
            fallbackUsed: true
          };
        } catch (fallbackError) {
          console.error(`❌ Fallback also failed for ${operationName}:`, fallbackError);
        }
      }

      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  private getErrorMessage(error: any): string {
    if (error?.code) {
      switch (error.code) {
        case 'permission-denied':
          return 'Permission denied - check Firebase rules';
        case 'not-found':
          return 'Document not found';
        case 'already-exists':
          return 'Document already exists';
        case 'unavailable':
          return 'Firebase service unavailable';
        case 'unauthenticated':
          return 'User not authenticated';
        default:
          return `Firebase error: ${error.code}`;
      }
    }

    if (error?.message) {
      if (error.message.includes('_checkNotDeleted')) {
        return 'Firebase reference error - document may have been deleted';
      }
      if (error.message.includes('toLowerCase')) {
        return 'Data format error - invalid string data';
      }
      return error.message;
    }

    return 'Unknown Firebase error';
  }

  // حفظ نتيجة اختبار مع fallback
  async saveTestResult(testResult: Omit<TestResult, 'id'>): Promise<SafeFirebaseResult<string>> {
    const operation = async () => {
      const docRef = await addDoc(collection(db, 'test_results'), {
        ...testResult,
        timestamp: serverTimestamp()
      });
      return docRef.id;
    };

    const fallback = () => {
      // حفظ في localStorage كـ fallback
      const localId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const localData = {
        ...testResult,
        id: localId,
        timestamp: new Date().toISOString(),
        savedToFirebase: false
      };

      const existingResults = JSON.parse(localStorage.getItem('test_results_fallback') || '[]');
      existingResults.push(localData);
      localStorage.setItem('test_results_fallback', JSON.stringify(existingResults));

      console.log('✅ Test result saved to localStorage as fallback:', localId);
      return localId;
    };

    return this.safeOperation(operation, fallback, 'save test result');
  }

  // جلب نتائج المستخدم
  async getUserTestResults(userId: string): Promise<SafeFirebaseResult<TestResult[]>> {
    const operation = async () => {
      const q = query(
        collection(db, 'test_results'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TestResult));
    };

    const fallback = () => {
      // جلب من localStorage
      const localResults = JSON.parse(localStorage.getItem('test_results_fallback') || '[]');
      return localResults.filter((result: TestResult) => result.userId === userId);
    };

    return this.safeOperation(operation, fallback, 'get user test results');
  }

  // تحديث نتيجة اختبار
  async updateTestResult(resultId: string, updates: Partial<TestResult>): Promise<SafeFirebaseResult<void>> {
    const operation = async () => {
      const docRef = doc(db, 'test_results', resultId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    };

    const fallback = () => {
      // تحديث في localStorage
      const localResults = JSON.parse(localStorage.getItem('test_results_fallback') || '[]');
      const updatedResults = localResults.map((result: TestResult) =>
        result.id === resultId ? { ...result, ...updates, updatedAt: new Date().toISOString() } : result
      );
      localStorage.setItem('test_results_fallback', JSON.stringify(updatedResults));
      console.log('✅ Test result updated in localStorage fallback');
    };

    return this.safeOperation(operation, fallback, 'update test result');
  }

  // حذف نتيجة اختبار
  async deleteTestResult(resultId: string): Promise<SafeFirebaseResult<void>> {
    const operation = async () => {
      const docRef = doc(db, 'test_results', resultId);
      await deleteDoc(docRef);
    };

    const fallback = () => {
      // حذف من localStorage
      const localResults = JSON.parse(localStorage.getItem('test_results_fallback') || '[]');
      const filteredResults = localResults.filter((result: TestResult) => result.id !== resultId);
      localStorage.setItem('test_results_fallback', JSON.stringify(filteredResults));
      console.log('✅ Test result deleted from localStorage fallback');
    };

    return this.safeOperation(operation, fallback, 'delete test result');
  }

  // فحص حالة Firebase
  async checkFirebaseHealth(): Promise<SafeFirebaseResult<boolean>> {
    const operation = async () => {
      // محاولة قراءة بسيطة للتحقق من الاتصال
      const testDoc = doc(db, 'health_check', 'test');
      await getDoc(testDoc);
      return true;
    };

    return this.safeOperation(operation, () => false, 'Firebase health check');
  }

  // مزامنة البيانات المحلية مع Firebase
  async syncLocalDataToFirebase(): Promise<SafeFirebaseResult<number>> {
    const operation = async () => {
      const localResults = JSON.parse(localStorage.getItem('test_results_fallback') || '[]');
      const unsynced = localResults.filter((result: TestResult) => !result.savedToFirebase);

      if (unsynced.length === 0) {
        return 0;
      }

      const batch = writeBatch(db);
      let syncedCount = 0;

      for (const result of unsynced) {
        try {
          const docRef = doc(collection(db, 'test_results'));
          batch.set(docRef, {
            ...result,
            timestamp: serverTimestamp(),
            syncedAt: serverTimestamp()
          });
          syncedCount++;
        } catch (error) {
          console.warn('⚠️ Failed to add result to batch:', error);
        }
      }

      if (syncedCount > 0) {
        await batch.commit();
        
        // تحديث البيانات المحلية لتعكس المزامنة
        const updatedResults = localResults.map((result: TestResult) =>
          unsynced.includes(result) ? { ...result, savedToFirebase: true } : result
        );
        localStorage.setItem('test_results_fallback', JSON.stringify(updatedResults));
      }

      return syncedCount;
    };

    return this.safeOperation(operation, () => 0, 'sync local data to Firebase');
  }
}

// إنشاء instance واحد للاستخدام
export const safeFirebaseService = new SafeFirebaseService();

// دالة مساعدة للحفظ الآمن
export async function saveUserTestResultSafe(testResult: Omit<TestResult, 'id'>): Promise<string> {
  console.log('📊 Attempting to save test result to Firebase...', testResult);

  const result = await safeFirebaseService.saveTestResult(testResult);
  
  if (result.success && result.data) {
    if (result.fallbackUsed) {
      console.log('🔄 Test result saved to localStorage fallback');
    } else {
      console.log('✅ Test result saved to Firebase successfully');
    }
    return result.data;
  } else {
    console.error('❌ Failed to save test result:', result.error);
    throw new Error(result.error || 'Failed to save test result');
  }
}
