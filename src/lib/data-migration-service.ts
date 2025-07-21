/**
 * Data Migration Service
 * خدمة نقل البيانات بين قاعدة البيانات المحلية و Firebase
 */

import { ChemicalTest } from '@/types';
import { databaseColorTestService } from './database-color-test-service';
import { firebaseTestsService } from './firebase-tests-service';

export interface MigrationResult {
  success: boolean;
  message: string;
  message_ar: string;
  transferred: number;
  failed: number;
  errors: string[];
  duration: number;
}

export interface MigrationOptions {
  overwrite: boolean;
  validateData: boolean;
  batchSize: number;
  skipExisting: boolean;
}

export class DataMigrationService {
  private static instance: DataMigrationService;

  static getInstance(): DataMigrationService {
    if (!DataMigrationService.instance) {
      DataMigrationService.instance = new DataMigrationService();
    }
    return DataMigrationService.instance;
  }

  /**
   * نقل البيانات من المحلية إلى Firebase
   * Transfer data from local to Firebase
   */
  async migrateLocalToFirebase(options: Partial<MigrationOptions> = {}): Promise<MigrationResult> {
    const startTime = Date.now();
    const defaultOptions: MigrationOptions = {
      overwrite: false,
      validateData: true,
      batchSize: 10,
      skipExisting: true,
      ...options
    };

    try {
      console.log('🔄 Starting migration from Local to Firebase...');
      console.log('🔄 بدء نقل البيانات من المحلية إلى Firebase...');

      // 1. تحميل البيانات المحلية
      const localTests = await databaseColorTestService.getAllTests();
      console.log(`📊 Found ${localTests.length} tests in local database`);

      if (localTests.length === 0) {
        return {
          success: false,
          message: 'No tests found in local database',
          message_ar: 'لا توجد اختبارات في قاعدة البيانات المحلية',
          transferred: 0,
          failed: 0,
          errors: ['Local database is empty'],
          duration: Date.now() - startTime
        };
      }

      // 2. تحميل البيانات الموجودة في Firebase
      let existingFirebaseTests: ChemicalTest[] = [];
      try {
        existingFirebaseTests = await firebaseTestsService.getAllTests();
        console.log(`📊 Found ${existingFirebaseTests.length} tests in Firebase`);
      } catch (error) {
        console.log('⚠️ Could not load Firebase tests, proceeding with migration...');
      }

      // 3. تحديد الاختبارات للنقل
      const existingIds = new Set(existingFirebaseTests.map(test => test.id));
      const testsToMigrate = defaultOptions.skipExisting 
        ? localTests.filter(test => !existingIds.has(test.id))
        : localTests;

      console.log(`🎯 Will migrate ${testsToMigrate.length} tests`);

      // 4. التحقق من صحة البيانات
      if (defaultOptions.validateData) {
        const validationErrors = this.validateTests(testsToMigrate);
        if (validationErrors.length > 0) {
          return {
            success: false,
            message: 'Data validation failed',
            message_ar: 'فشل في التحقق من صحة البيانات',
            transferred: 0,
            failed: testsToMigrate.length,
            errors: validationErrors,
            duration: Date.now() - startTime
          };
        }
      }

      // 5. نقل البيانات على دفعات
      let transferred = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 0; i < testsToMigrate.length; i += defaultOptions.batchSize) {
        const batch = testsToMigrate.slice(i, i + defaultOptions.batchSize);
        
        for (const test of batch) {
          try {
            // تنظيف البيانات قبل النقل
            const cleanedTest = {
              method_name: test.method_name || 'Unnamed Test',
              method_name_ar: test.method_name_ar || 'اختبار بدون اسم',
              test_type: test.test_type || test.category || 'general',
              test_number: test.test_number || String(transferred + 1),
              prepare: test.prepare || 'Standard preparation',
              prepare_ar: test.prepare_ar || 'تحضير قياسي',
              reference: test.reference || 'Migration Import',
              results: (test.color_results || []).map((result: any) => ({
                color_result: result.color || result.color_result || 'Unknown Color',
                color_result_ar: result.color_ar || result.color_result_ar || 'لون غير معروف',
                possible_substance: result.substance || result.possible_substance || 'Unknown Substance',
                possible_substance_ar: result.substance_ar || result.possible_substance_ar || 'مادة غير معروفة',
                confidence_level: result.confidence || result.confidence_level || 'medium'
              })).filter(result =>
                result.color_result &&
                result.color_result !== 'undefined' &&
                result.color_result !== 'null' &&
                result.possible_substance &&
                result.possible_substance !== 'undefined' &&
                result.possible_substance !== 'null'
              ),
              created_by: 'migration_service'
            };

            if (defaultOptions.overwrite && existingIds.has(test.id)) {
              await firebaseTestsService.updateTest(test.id, cleanedTest);
            } else {
              await firebaseTestsService.addTest(cleanedTest);
            }
            transferred++;
            console.log(`✅ Migrated: ${cleanedTest.method_name} (${cleanedTest.results.length} clean results)`);
          } catch (error) {
            failed++;
            const errorMsg = `Failed to migrate ${test.method_name}: ${error}`;
            errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
        }

        // استراحة قصيرة بين الدفعات
        if (i + defaultOptions.batchSize < testsToMigrate.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const duration = Date.now() - startTime;
      const success = transferred > 0 && failed === 0;

      return {
        success,
        message: `Migration completed: ${transferred} transferred, ${failed} failed`,
        message_ar: `اكتمل النقل: ${transferred} تم نقلها، ${failed} فشلت`,
        transferred,
        failed,
        errors,
        duration
      };

    } catch (error) {
      console.error('❌ Migration failed:', error);
      return {
        success: false,
        message: `Migration failed: ${error}`,
        message_ar: `فشل النقل: ${error}`,
        transferred: 0,
        failed: 0,
        errors: [String(error)],
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * نقل البيانات من Firebase إلى المحلية
   * Transfer data from Firebase to local
   */
  async migrateFirebaseToLocal(options: Partial<MigrationOptions> = {}): Promise<MigrationResult> {
    const startTime = Date.now();
    const defaultOptions: MigrationOptions = {
      overwrite: false,
      validateData: true,
      batchSize: 10,
      skipExisting: true,
      ...options
    };

    try {
      console.log('🔄 Starting migration from Firebase to Local...');
      console.log('🔄 بدء نقل البيانات من Firebase إلى المحلية...');

      // 1. تحميل البيانات من Firebase
      const firebaseTests = await firebaseTestsService.getAllTests();
      console.log(`📊 Found ${firebaseTests.length} tests in Firebase`);

      if (firebaseTests.length === 0) {
        return {
          success: false,
          message: 'No tests found in Firebase',
          message_ar: 'لا توجد اختبارات في Firebase',
          transferred: 0,
          failed: 0,
          errors: ['Firebase database is empty'],
          duration: Date.now() - startTime
        };
      }

      // 2. تحميل البيانات المحلية الموجودة
      const localTests = await databaseColorTestService.getAllTests();
      console.log(`📊 Found ${localTests.length} tests in local database`);

      // 3. تحديد الاختبارات للنقل
      const existingIds = new Set(localTests.map(test => test.id));
      const testsToMigrate = defaultOptions.skipExisting 
        ? firebaseTests.filter(test => !existingIds.has(test.id))
        : firebaseTests;

      console.log(`🎯 Will migrate ${testsToMigrate.length} tests`);

      // 4. التحقق من صحة البيانات
      if (defaultOptions.validateData) {
        const validationErrors = this.validateTests(testsToMigrate);
        if (validationErrors.length > 0) {
          return {
            success: false,
            message: 'Data validation failed',
            message_ar: 'فشل في التحقق من صحة البيانات',
            transferred: 0,
            failed: testsToMigrate.length,
            errors: validationErrors,
            duration: Date.now() - startTime
          };
        }
      }

      // 5. نقل البيانات (محاكاة - لأن المحلية للقراءة فقط)
      let transferred = 0;
      let failed = 0;
      const errors: string[] = [];

      // ملاحظة: هذا مثال لكيفية النقل
      // في التطبيق الحقيقي، ستحتاج لتحديث ملف JSON المحلي
      for (const test of testsToMigrate) {
        try {
          // هنا يمكن إضافة منطق كتابة البيانات للملف المحلي
          // أو إنشاء ملف جديد للبيانات المدمجة
          transferred++;
          console.log(`✅ Prepared for migration: ${test.method_name}`);
        } catch (error) {
          failed++;
          const errorMsg = `Failed to prepare ${test.method_name}: ${error}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      const duration = Date.now() - startTime;
      const success = transferred > 0 && failed === 0;

      return {
        success,
        message: `Migration prepared: ${transferred} tests ready for local update`,
        message_ar: `تم تحضير النقل: ${transferred} اختبار جاهز للتحديث المحلي`,
        transferred,
        failed,
        errors,
        duration
      };

    } catch (error) {
      console.error('❌ Migration failed:', error);
      return {
        success: false,
        message: `Migration failed: ${error}`,
        message_ar: `فشل النقل: ${error}`,
        transferred: 0,
        failed: 0,
        errors: [String(error)],
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * مزامنة البيانات بين المحلية و Firebase
   * Synchronize data between local and Firebase
   */
  async synchronizeData(): Promise<MigrationResult> {
    const startTime = Date.now();

    try {
      console.log('🔄 Starting data synchronization...');
      console.log('🔄 بدء مزامنة البيانات...');

      // 1. تحميل البيانات من كلا المصدرين
      const [localTests, firebaseTests] = await Promise.all([
        databaseColorTestService.getAllTests(),
        firebaseTestsService.getAllTests().catch(() => [])
      ]);

      console.log(`📊 Local: ${localTests.length}, Firebase: ${firebaseTests.length}`);

      // 2. تحليل الاختلافات
      const localIds = new Set(localTests.map(test => test.id));
      const firebaseIds = new Set(firebaseTests.map(test => test.id));

      const onlyInLocal = localTests.filter(test => !firebaseIds.has(test.id));
      const onlyInFirebase = firebaseTests.filter(test => !localIds.has(test.id));

      console.log(`📊 Only in Local: ${onlyInLocal.length}, Only in Firebase: ${onlyInFirebase.length}`);

      // 3. نقل البيانات المفقودة
      let transferred = 0;
      let failed = 0;
      const errors: string[] = [];

      // نقل من المحلية إلى Firebase
      for (const test of onlyInLocal) {
        try {
          await firebaseTestsService.addTest(test);
          transferred++;
          console.log(`✅ Added to Firebase: ${test.method_name}`);
        } catch (error) {
          failed++;
          errors.push(`Failed to add ${test.method_name} to Firebase: ${error}`);
        }
      }

      const duration = Date.now() - startTime;
      const success = failed === 0;

      return {
        success,
        message: `Synchronization completed: ${transferred} tests synchronized`,
        message_ar: `اكتملت المزامنة: ${transferred} اختبار تم مزامنته`,
        transferred,
        failed,
        errors,
        duration
      };

    } catch (error) {
      console.error('❌ Synchronization failed:', error);
      return {
        success: false,
        message: `Synchronization failed: ${error}`,
        message_ar: `فشلت المزامنة: ${error}`,
        transferred: 0,
        failed: 0,
        errors: [String(error)],
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * التحقق من صحة البيانات
   * Validate test data
   */
  private validateTests(tests: ChemicalTest[]): string[] {
    const errors: string[] = [];

    for (const test of tests) {
      // التحقق من المعرف
      if (!test.id || test.id === 'undefined') {
        errors.push(`Test missing or invalid ID: ${test.method_name || 'Unknown'}`);
      }

      // التحقق من الاسم الإنجليزي
      if (!test.method_name || test.method_name === 'undefined') {
        errors.push(`Test missing or invalid method_name: ${test.id || 'Unknown'}`);
      }

      // التحقق من الاسم العربي
      if (!test.method_name_ar || test.method_name_ar === 'undefined') {
        errors.push(`Test missing or invalid Arabic name: ${test.id || 'Unknown'}`);
      }

      // التحقق من النتائج اللونية
      const results = test.color_results || test.results || [];
      if (!Array.isArray(results) || results.length === 0) {
        errors.push(`Test missing color results: ${test.id || 'Unknown'}`);
      } else {
        // التحقق من صحة كل نتيجة
        results.forEach((result: any, index: number) => {
          const colorResult = result.color_result || result.color;
          const substance = result.possible_substance || result.substance;

          if (!colorResult || colorResult === 'undefined' || colorResult === 'null') {
            errors.push(`Test ${test.id}, Result ${index + 1}: Missing or invalid color_result`);
          }
          if (!substance || substance === 'undefined' || substance === 'null') {
            errors.push(`Test ${test.id}, Result ${index + 1}: Missing or invalid possible_substance`);
          }
        });
      }
    }

    console.log(`🔍 Validation completed: ${errors.length} errors found in ${tests.length} tests`);
    return errors;
  }

  /**
   * مقارنة البيانات بين المصدرين
   * Compare data between sources
   */
  async compareData(): Promise<{
    localCount: number;
    firebaseCount: number;
    onlyInLocal: string[];
    onlyInFirebase: string[];
    differences: Array<{
      id: string;
      field: string;
      localValue: any;
      firebaseValue: any;
    }>;
  }> {
    try {
      const [localTests, firebaseTests] = await Promise.all([
        databaseColorTestService.getAllTests(),
        firebaseTestsService.getAllTests().catch(() => [])
      ]);

      const localMap = new Map(localTests.map(test => [test.id, test]));
      const firebaseMap = new Map(firebaseTests.map(test => [test.id, test]));

      const onlyInLocal = localTests
        .filter(test => !firebaseMap.has(test.id))
        .map(test => test.id);

      const onlyInFirebase = firebaseTests
        .filter(test => !localMap.has(test.id))
        .map(test => test.id);

      const differences: Array<{
        id: string;
        field: string;
        localValue: any;
        firebaseValue: any;
      }> = [];

      // مقارنة الاختبارات الموجودة في كلا المصدرين
      for (const [id, localTest] of localMap) {
        const firebaseTest = firebaseMap.get(id);
        if (firebaseTest) {
          // مقارنة الحقول المهمة
          const fieldsToCompare = ['method_name', 'method_name_ar', 'description', 'description_ar'];
          for (const field of fieldsToCompare) {
            if (localTest[field as keyof ChemicalTest] !== firebaseTest[field as keyof ChemicalTest]) {
              differences.push({
                id,
                field,
                localValue: localTest[field as keyof ChemicalTest],
                firebaseValue: firebaseTest[field as keyof ChemicalTest]
              });
            }
          }
        }
      }

      return {
        localCount: localTests.length,
        firebaseCount: firebaseTests.length,
        onlyInLocal,
        onlyInFirebase,
        differences
      };

    } catch (error) {
      console.error('❌ Data comparison failed:', error);
      throw error;
    }
  }
}

export const dataMigrationService = DataMigrationService.getInstance();
