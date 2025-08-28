'use client';

import { useCallback } from 'react';
import { useAuth } from '@/components/safe-providers';
import { saveUserTestResult, UserTestResult } from '@/lib/user-test-history';
import toast from 'react-hot-toast';

interface TestCompletionData {
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
  duration?: number;
  notes?: string;
}

export function useTestCompletion() {
  const { user } = useAuth();

  const completeTest = useCallback(async (testData: TestCompletionData): Promise<string | null> => {
    if (!user?.uid) {
      console.error('❌ No user logged in');
      toast.error('Please log in to save test results');
      return null;
    }

    try {
      console.log('🔄 Saving test completion for user:', user.uid);
      console.log('📊 Test data:', testData);

      const testResult: Omit<UserTestResult, 'id' | 'timestamp' | 'completedAt'> = {
        userId: user.uid,
        testId: testData.testId,
        testName: testData.testName,
        testNameAr: testData.testNameAr,
        selectedColor: testData.selectedColor,
        result: testData.result,
        duration: testData.duration,
        notes: testData.notes
      };

      const resultId = await saveUserTestResult(testResult);
      
      console.log('✅ Test result saved with ID:', resultId);
      toast.success('Test completed and saved successfully!');
      
      return resultId;
    } catch (error) {
      console.error('❌ Error saving test result:', error);
      toast.error('Failed to save test result');
      return null;
    }
  }, [user]);

  const isUserLoggedIn = !!user?.uid;

  return {
    completeTest,
    isUserLoggedIn,
    userId: user?.uid
  };
}

// Helper function to extract test completion data from color selection
export function createTestCompletionData(
  testId: string,
  testName: string,
  testNameAr: string,
  selectedColorResult: any,
  startTime?: number
): TestCompletionData {
  const endTime = Date.now();
  const duration = startTime ? Math.round((endTime - startTime) / 1000) : undefined;

  // Extract substance information
  const substance = selectedColorResult.possible_substance || 'Unknown';
  const substanceAr = selectedColorResult.possible_substance_ar || 'غير معروف';
  
  // Calculate confidence and accuracy
  const confidence = selectedColorResult.confidence_level || '0';
  const confidenceNum = parseFloat(confidence);
  const accuracy = Math.min(100, Math.max(0, confidenceNum));

  return {
    testId,
    testName,
    testNameAr,
    selectedColor: {
      id: selectedColorResult.id,
      hex_code: selectedColorResult.hex_code,
      color_name: {
        ar: selectedColorResult.color_result_ar || 'لون غير محدد',
        en: selectedColorResult.color_result || 'Undefined color'
      },
      substance_name: {
        ar: substanceAr,
        en: substance
      },
      confidence_level: confidence
    },
    result: {
      substance,
      substanceAr,
      confidence,
      accuracy
    },
    duration
  };
}

// Hook for tracking test start time
export function useTestTimer() {
  const startTest = useCallback(() => {
    const startTime = Date.now();
    console.log('⏱️ Test started at:', new Date(startTime).toISOString());
    return startTime;
  }, []);

  const getTestDuration = useCallback((startTime: number) => {
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    console.log(`⏱️ Test completed in ${duration} seconds`);
    return duration;
  }, []);

  return {
    startTest,
    getTestDuration
  };
}
