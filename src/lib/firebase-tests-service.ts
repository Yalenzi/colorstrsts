import { database } from './firebase';
import { ref, push, set, get, update, remove, child, query, orderByChild } from 'firebase/database';

export interface TestResult {
  id?: string;
  color_result: string;
  color_result_ar: string;
  possible_substance: string;
  possible_substance_ar: string;
  hex_color?: string;
  rgb_color?: string;
  confidence_level?: number;
}

export interface ChemicalTest {
  id?: string;
  method_name: string;
  method_name_ar: string;
  test_type: string;
  test_number: string;
  prepare: string;
  prepare_ar: string;
  reference?: string;
  results: TestResult[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface TestStatistics {
  total_tests: number;
  total_results: number;
  unique_substances: number;
  unique_colors: number;
  tests_by_type: Record<string, number>;
}

class FirebaseTestsService {
  private testsRef = ref(database, 'chemical_tests');

  // إضافة اختبار جديد
  async addTest(test: Omit<ChemicalTest, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const newTestRef = push(this.testsRef);

      // Clean and validate test data before saving
      const cleanedTest = {
        method_name: test.method_name || 'Unnamed Test',
        method_name_ar: test.method_name_ar || 'اختبار بدون اسم',
        test_type: test.test_type || 'general',
        test_number: test.test_number || '0',
        prepare: test.prepare || 'No preparation instructions',
        prepare_ar: test.prepare_ar || 'لا توجد تعليمات تحضير',
        reference: test.reference || 'No reference',
        created_by: test.created_by || 'unknown',
        results: (test.results || []).map((result: any) => ({
          color_result: result.color_result || 'Unknown',
          color_result_ar: result.color_result_ar || 'غير معروف',
          possible_substance: result.possible_substance || 'Unknown',
          possible_substance_ar: result.possible_substance_ar || 'غير معروف',
          confidence_level: result.confidence_level || 'medium'
        })).filter(result =>
          // Remove invalid results
          result.color_result &&
          result.color_result !== 'undefined' &&
          result.color_result !== 'null' &&
          result.possible_substance &&
          result.possible_substance !== 'undefined' &&
          result.possible_substance !== 'null'
        )
      };

      const testData: ChemicalTest = {
        ...cleanedTest,
        id: newTestRef.key!,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log(`💾 Saving test: ${cleanedTest.method_name} with ${cleanedTest.results.length} clean results`);
      await set(newTestRef, testData);
      return newTestRef.key!;

    } catch (error) {
      console.error('Error adding test:', error);
      throw new Error(`Failed to add test: ${error}`);
    }
  }

  // تحديث اختبار موجود
  async updateTest(testId: string, updates: Partial<ChemicalTest>): Promise<void> {
    try {
      const testRef = ref(database, `chemical_tests/${testId}`);
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      await update(testRef, updateData);
    } catch (error) {
      console.error('Error updating test:', error);
      throw new Error('Failed to update test');
    }
  }

  // حذف اختبار
  async deleteTest(testId: string): Promise<void> {
    try {
      const testRef = ref(database, `chemical_tests/${testId}`);
      await remove(testRef);
    } catch (error) {
      console.error('Error deleting test:', error);
      throw new Error('Failed to delete test');
    }
  }

  // جلب جميع الاختبارات
  async getAllTests(): Promise<ChemicalTest[]> {
    try {
      const snapshot = await get(this.testsRef);
      if (snapshot.exists()) {
        const testsData = snapshot.val();
        return Object.values(testsData) as ChemicalTest[];
      }
      return [];
    } catch (error) {
      console.error('Error fetching tests:', error);
      throw new Error('Failed to fetch tests');
    }
  }

  // جلب اختبار واحد
  async getTest(testId: string): Promise<ChemicalTest | null> {
    try {
      const testRef = ref(database, `chemical_tests/${testId}`);
      const snapshot = await get(testRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as ChemicalTest;
      }
      return null;
    } catch (error) {
      console.error('Error fetching test:', error);
      throw new Error('Failed to fetch test');
    }
  }

  // البحث في الاختبارات
  async searchTests(searchQuery: string): Promise<ChemicalTest[]> {
    try {
      const tests = await this.getAllTests();
      const query = searchQuery.toLowerCase();
      
      return tests.filter(test => 
        test.method_name.toLowerCase().includes(query) ||
        test.method_name_ar.includes(query) ||
        test.test_type.toLowerCase().includes(query) ||
        test.results.some(result => 
          result.possible_substance.toLowerCase().includes(query) ||
          result.possible_substance_ar.includes(query) ||
          result.color_result.toLowerCase().includes(query) ||
          result.color_result_ar.includes(query)
        )
      );
    } catch (error) {
      console.error('Error searching tests:', error);
      throw new Error('Failed to search tests');
    }
  }

  // جلب الاختبارات حسب النوع
  async getTestsByType(testType: string): Promise<ChemicalTest[]> {
    try {
      const tests = await this.getAllTests();
      return tests.filter(test => test.test_type === testType);
    } catch (error) {
      console.error('Error fetching tests by type:', error);
      throw new Error('Failed to fetch tests by type');
    }
  }

  // إضافة نتيجة جديدة لاختبار موجود
  async addResultToTest(testId: string, result: TestResult): Promise<void> {
    try {
      const test = await this.getTest(testId);
      if (!test) {
        throw new Error('Test not found');
      }

      const updatedResults = [...test.results, result];
      await this.updateTest(testId, { results: updatedResults });
    } catch (error) {
      console.error('Error adding result to test:', error);
      throw new Error('Failed to add result to test');
    }
  }

  // تحديث نتيجة في اختبار
  async updateTestResult(testId: string, resultIndex: number, updatedResult: TestResult): Promise<void> {
    try {
      const test = await this.getTest(testId);
      if (!test) {
        throw new Error('Test not found');
      }

      if (resultIndex < 0 || resultIndex >= test.results.length) {
        throw new Error('Result index out of bounds');
      }

      const updatedResults = [...test.results];
      updatedResults[resultIndex] = updatedResult;
      
      await this.updateTest(testId, { results: updatedResults });
    } catch (error) {
      console.error('Error updating test result:', error);
      throw new Error('Failed to update test result');
    }
  }

  // حذف نتيجة من اختبار
  async deleteTestResult(testId: string, resultIndex: number): Promise<void> {
    try {
      const test = await this.getTest(testId);
      if (!test) {
        throw new Error('Test not found');
      }

      if (resultIndex < 0 || resultIndex >= test.results.length) {
        throw new Error('Result index out of bounds');
      }

      const updatedResults = test.results.filter((_, index) => index !== resultIndex);
      await this.updateTest(testId, { results: updatedResults });
    } catch (error) {
      console.error('Error deleting test result:', error);
      throw new Error('Failed to delete test result');
    }
  }

  // جلب إحصائيات الاختبارات
  async getTestsStatistics(): Promise<TestStatistics> {
    try {
      const tests = await this.getAllTests();

      if (!tests || !Array.isArray(tests)) {
        console.warn('⚠️ No tests data available for statistics');
        return {
          total_tests: 0,
          total_results: 0,
          unique_substances: 0,
          unique_colors: 0,
          tests_by_type: {}
        };
      }

      const totalTests = tests.length;
      const totalResults = tests.reduce((sum, test) => {
        // Safe access to results array
        const results = test.results || test.color_results || [];
        return sum + (Array.isArray(results) ? results.length : 0);
      }, 0);

      const uniqueSubstances = new Set();
      const uniqueColors = new Set();
      const testsByType: Record<string, number> = {};

      tests.forEach(test => {
        // Count test types safely
        const testType = test.test_type || test.category || 'unknown';
        testsByType[testType] = (testsByType[testType] || 0) + 1;

        // Count unique substances and colors safely
        const results = test.results || test.color_results || [];
        if (Array.isArray(results)) {
          results.forEach(result => {
            if (result) {
              // Handle different result formats
              const substance = result.possible_substance || result.substance || '';
              const color = result.color_result || result.color || '';

              if (substance) uniqueSubstances.add(substance.toLowerCase());
              if (color) uniqueColors.add(color.toLowerCase());
            }
          });
        }
      });

      const statistics = {
        total_tests: totalTests,
        total_results: totalResults,
        unique_substances: uniqueSubstances.size,
        unique_colors: uniqueColors.size,
        tests_by_type: testsByType
      };

      console.log('📊 Statistics calculated:', statistics);
      return statistics;

    } catch (error) {
      console.error('Error getting statistics:', error);
      // Return safe default values instead of throwing
      return {
        total_tests: 0,
        total_results: 0,
        unique_substances: 0,
        unique_colors: 0,
        tests_by_type: {}
      };
    }
  }

  // نسخ البيانات من JSON إلى Firebase (للمرة الأولى فقط)
  async importFromJSON(jsonData: any[]): Promise<void> {
    try {
      console.log(`🔄 Starting import of ${jsonData.length} tests to Firebase...`);

      const batch = jsonData.map(async (testData, index) => {
        try {
          // Clean and validate data before sending to Firebase
          const cleanedResults = (testData.results || []).map((result: any) => ({
            color_result: result.color_result || result.color || 'Unknown Color',
            color_result_ar: result.color_result_ar || result.color_ar || 'لون غير معروف',
            possible_substance: result.possible_substance || result.substance || 'Unknown Substance',
            possible_substance_ar: result.possible_substance_ar || result.substance_ar || 'مادة غير معروفة',
            confidence_level: result.confidence_level || result.confidence || 'medium'
          })).filter(result =>
            // Remove results with undefined or null values
            result.color_result &&
            result.color_result !== 'undefined' &&
            result.possible_substance &&
            result.possible_substance !== 'undefined'
          );

          const test: Omit<ChemicalTest, 'id' | 'created_at' | 'updated_at'> = {
            method_name: testData.method_name || `Test ${index + 1}`,
            method_name_ar: testData.method_name_ar || `اختبار ${index + 1}`,
            test_type: testData.test_type || 'general',
            test_number: testData.test_number || `${index + 1}`,
            prepare: testData.prepare || 'Standard preparation',
            prepare_ar: testData.prepare_ar || 'تحضير قياسي',
            reference: testData.reference || 'System Import',
            results: cleanedResults,
            created_by: 'system_import'
          };

          console.log(`📝 Processing test ${index + 1}: ${test.method_name} (${cleanedResults.length} results)`);
          return this.addTest(test);

        } catch (testError) {
          console.error(`❌ Error processing test ${index + 1}:`, testError);
          throw new Error(`Failed to process test ${index + 1}: ${testError}`);
        }
      });

      await Promise.all(batch);
      console.log('✅ All tests imported successfully to Firebase');

    } catch (error) {
      console.error('Error importing from JSON:', error);
      throw new Error(`Failed to import from JSON: ${error}`);
    }
  }
}

export const firebaseTestsService = new FirebaseTestsService();
