'use client';

import { db } from '@/lib/firebase';
import { ref, push, set, get, query, orderByChild, equalTo, limitToLast } from 'firebase/database';

export interface UserTestResult {
  id?: string;
  userId: string;
  testId: string;
  testName: string;
  testNameAr: string;
  selectedColor: {
    id: string;
    hex_code: string;
    color_name: {
      ar: string;
      en: string;
    };
    substance_name?: {
      ar: string;
      en: string;
    };
    confidence_level: string;
  };
  result: {
    substance: string;
    substanceAr: string;
    confidence: string;
    accuracy: number;
  };
  timestamp: number;
  completedAt: string; // ISO string
  duration?: number; // in seconds
  notes?: string;
}

export interface UserTestStats {
  totalTests: number;
  completedTests: number;
  averageAccuracy: number;
  mostTestedSubstance: string;
  recentTests: UserTestResult[];
  testsByMonth: { [month: string]: number };
}

// Save a completed test result
export async function saveUserTestResult(testResult: Omit<UserTestResult, 'id' | 'timestamp' | 'completedAt'>): Promise<string> {
  try {
    // Check if Firebase is available
    if (!db) {
      console.error('❌ Firebase database not initialized');
      throw new Error('Database not available');
    }

    console.log('🔄 Attempting to save test result to Firebase...');
    console.log('📊 Test result data:', {
      userId: testResult.userId,
      testId: testResult.testId,
      testName: testResult.testName
    });

    const userTestsRef = ref(db, 'userTestResults');
    const newTestRef = push(userTestsRef);

    const completeTestResult: UserTestResult = {
      ...testResult,
      timestamp: Date.now(),
      completedAt: new Date().toISOString(),
    };

    await set(newTestRef, completeTestResult);

    console.log('✅ Test result saved successfully to Firebase:', newTestRef.key);

    // Also save to localStorage as backup
    try {
      const localResults = JSON.parse(localStorage.getItem('user_test_results') || '[]');
      localResults.push({ ...completeTestResult, id: newTestRef.key });
      localStorage.setItem('user_test_results', JSON.stringify(localResults));
      console.log('💾 Test result also saved to localStorage as backup');
    } catch (localError) {
      console.warn('⚠️ Failed to save to localStorage:', localError);
    }

    return newTestRef.key!;
  } catch (error) {
    console.error('❌ Error saving test result to Firebase:', error);

    // Fallback to localStorage if Firebase fails
    try {
      console.log('🔄 Attempting fallback save to localStorage...');
      const fallbackId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const completeTestResult: UserTestResult = {
        ...testResult,
        id: fallbackId,
        timestamp: Date.now(),
        completedAt: new Date().toISOString(),
      };

      const localResults = JSON.parse(localStorage.getItem('user_test_results') || '[]');
      localResults.push(completeTestResult);
      localStorage.setItem('user_test_results', JSON.stringify(localResults));

      console.log('✅ Test result saved to localStorage as fallback:', fallbackId);
      return fallbackId;
    } catch (fallbackError) {
      console.error('❌ Fallback save to localStorage also failed:', fallbackError);
      throw new Error(`Failed to save test result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Get user's test history
export async function getUserTestHistory(userId: string, limit: number = 10): Promise<UserTestResult[]> {
  try {
    const userTestsRef = ref(db, 'userTestResults');
    const userTestsQuery = query(
      userTestsRef,
      orderByChild('userId'),
      equalTo(userId),
      limitToLast(limit)
    );

    const snapshot = await get(userTestsQuery);
    
    if (!snapshot.exists()) {
      console.log('ℹ️ No test history found for user:', userId);
      return [];
    }

    const tests: UserTestResult[] = [];
    snapshot.forEach((childSnapshot) => {
      const testData = childSnapshot.val();
      tests.push({
        id: childSnapshot.key!,
        ...testData
      });
    });

    // Sort by timestamp descending (most recent first)
    tests.sort((a, b) => b.timestamp - a.timestamp);
    
    console.log(`✅ Loaded ${tests.length} test results for user:`, userId);
    return tests;
  } catch (error) {
    console.error('❌ Error loading user test history:', error);
    return [];
  }
}

// Get user's test statistics
export async function getUserTestStats(userId: string): Promise<UserTestStats> {
  try {
    const allTests = await getUserTestHistory(userId, 100); // Get more for stats
    
    if (allTests.length === 0) {
      return {
        totalTests: 0,
        completedTests: 0,
        averageAccuracy: 0,
        mostTestedSubstance: '',
        recentTests: [],
        testsByMonth: {}
      };
    }

    // Calculate statistics
    const totalTests = allTests.length;
    const completedTests = allTests.filter(test => test.result).length;
    const averageAccuracy = allTests.reduce((sum, test) => sum + (test.result?.accuracy || 0), 0) / completedTests;
    
    // Find most tested substance
    const substanceCounts: { [key: string]: number } = {};
    allTests.forEach(test => {
      const substance = test.result?.substance || 'Unknown';
      substanceCounts[substance] = (substanceCounts[substance] || 0) + 1;
    });
    
    const mostTestedSubstance = Object.keys(substanceCounts).reduce((a, b) => 
      substanceCounts[a] > substanceCounts[b] ? a : b, ''
    );

    // Group tests by month
    const testsByMonth: { [month: string]: number } = {};
    allTests.forEach(test => {
      const date = new Date(test.completedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      testsByMonth[monthKey] = (testsByMonth[monthKey] || 0) + 1;
    });

    const recentTests = allTests.slice(0, 5); // Last 5 tests

    return {
      totalTests,
      completedTests,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      mostTestedSubstance,
      recentTests,
      testsByMonth
    };
  } catch (error) {
    console.error('❌ Error calculating user test stats:', error);
    return {
      totalTests: 0,
      completedTests: 0,
      averageAccuracy: 0,
      mostTestedSubstance: '',
      recentTests: [],
      testsByMonth: {}
    };
  }
}

// Get recent tests for dashboard
export async function getRecentTestsForDashboard(userId: string): Promise<UserTestResult[]> {
  try {
    const recentTests = await getUserTestHistory(userId, 5);
    console.log(`✅ Loaded ${recentTests.length} recent tests for dashboard`);
    return recentTests;
  } catch (error) {
    console.error('❌ Error loading recent tests for dashboard:', error);
    return [];
  }
}

// Check if user has completed a specific test
export async function hasUserCompletedTest(userId: string, testId: string): Promise<boolean> {
  try {
    const userTestsRef = ref(db, 'userTestResults');
    const userTestsQuery = query(
      userTestsRef,
      orderByChild('userId'),
      equalTo(userId)
    );

    const snapshot = await get(userTestsQuery);
    
    if (!snapshot.exists()) {
      return false;
    }

    let hasCompleted = false;
    snapshot.forEach((childSnapshot) => {
      const testData = childSnapshot.val();
      if (testData.testId === testId) {
        hasCompleted = true;
      }
    });

    return hasCompleted;
  } catch (error) {
    console.error('❌ Error checking if user completed test:', error);
    return false;
  }
}

// Delete a test result
export async function deleteUserTestResult(testResultId: string): Promise<void> {
  try {
    const testResultRef = ref(db, `userTestResults/${testResultId}`);
    await set(testResultRef, null);
    console.log('✅ Test result deleted successfully:', testResultId);
  } catch (error) {
    console.error('❌ Error deleting test result:', error);
    throw error;
  }
}

// Update test result notes
export async function updateTestResultNotes(testResultId: string, notes: string): Promise<void> {
  try {
    const testResultRef = ref(db, `userTestResults/${testResultId}/notes`);
    await set(testResultRef, notes);
    console.log('✅ Test result notes updated successfully:', testResultId);
  } catch (error) {
    console.error('❌ Error updating test result notes:', error);
    throw error;
  }
}
