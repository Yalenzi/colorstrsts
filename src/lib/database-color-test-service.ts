// خدمة تحميل البيانات من DatabaseColorTest.json
// Database Color Test Service

interface DatabaseColorTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  color_result: string;
  color_result_ar: string;
  possible_substance: string;
  possible_substance_ar: string;
  prepare: string;
  prepare_ar: string;
  test_type: string;
  test_number: string;
  reference: string;
}

interface GroupedTest {
  method_name: string;
  method_name_ar: string;
  test_type: string;
  test_number: string;
  reference: string;
  prepare: string;
  prepare_ar: string;
  results: {
    color_result: string;
    color_result_ar: string;
    possible_substance: string;
    possible_substance_ar: string;
  }[];
  total_results: number;
}

class DatabaseColorTestService {
  private static instance: DatabaseColorTestService;
  private tests: DatabaseColorTest[] = [];
  private groupedTests: GroupedTest[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): DatabaseColorTestService {
    if (!DatabaseColorTestService.instance) {
      DatabaseColorTestService.instance = new DatabaseColorTestService();
    }
    return DatabaseColorTestService.instance;
  }

  /**
   * تهيئة الخدمة وتحميل البيانات
   * Initialize service and load data
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadTests();
      this.groupTests();
      this.isInitialized = true;
      console.log('✅ Database Color Test Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Database Color Test Service:', error);
    }
  }

  /**
   * تحميل الاختبارات من Db.json
   * Load tests from Db.json
   */
  private async loadTests(): Promise<void> {
    try {
      console.log('🔄 Loading chemical tests from Db.json...');

      // Try API first to ensure live data across public and admin
      try {
        const apiRes = await fetch('/api/tests/load-from-db');
        const contentType = apiRes.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        if (apiRes.ok && isJson) {
          const apiData = await apiRes.json();
          const apiTests = Array.isArray(apiData?.tests)
            ? apiData.tests
            : Array.isArray(apiData?.chemical_tests)
            ? apiData.chemical_tests
            : [];
          if (apiTests.length > 0) {
            this.tests = apiTests;
            localStorage.setItem('chemical_tests_data', JSON.stringify({ chemical_tests: apiTests }));
            console.log(`✅ Loaded ${apiTests.length} chemical tests from API`);
            return;
          }
        } else {
          console.warn('⚠️ API not available or non-JSON, will fallback to static sources');
        }
      } catch (apiError: any) {
        console.warn('⚠️ API load failed, falling back to static sources:', apiError?.message || apiError);
      }

      // Try to load from localStorage next (for performance)
      const savedTests = localStorage.getItem('chemical_tests_data');
      if (savedTests) {
        try {
          const data = JSON.parse(savedTests);
          this.tests = data.chemical_tests || data;
          console.log(`📦 Loaded ${this.tests.length} chemical tests from localStorage`);
          return;
        } catch (parseError) {
          console.warn('⚠️ Failed to parse localStorage data, clearing...');
          localStorage.removeItem('chemical_tests_data');
        }
      }

      // Import the JSON data directly from src/data/Db.json
      try {
        const data = await import('@/data/Db.json');
        this.tests = data.chemical_tests || [];

        // Save to localStorage for future use
        localStorage.setItem('chemical_tests_data', JSON.stringify(data));
        console.log(`✅ Loaded ${this.tests.length} chemical tests from Db.json`);
        return;
      } catch (importError) {
        console.warn('⚠️ Could not import Db.json directly, trying fetch...');
      }

      // Try to load from public paths as fallback
      const paths = [
        '/data/Db.json',
        '/src/data/Db.json'
      ];

      for (const path of paths) {
        try {
          console.log(`🔄 Trying to fetch from ${path}...`);
          const response = await fetch(path);
          if (response.ok) {
            const data = await response.json();
            this.tests = data.chemical_tests || data;

            // Save to localStorage
            localStorage.setItem('chemical_tests_data', JSON.stringify(data));
            console.log(`✅ Loaded ${this.tests.length} chemical tests from ${path}`);
            return;
          }
        } catch (e) {
          console.warn(`⚠️ Could not load from ${path}:`, e.message);
        }
      }

      // If all paths fail, use fallback data
      console.warn('⚠️ All data sources failed, using fallback data');
      this.tests = this.getFallbackTests();
      localStorage.setItem('chemical_tests_data', JSON.stringify({ chemical_tests: this.tests }));
      console.log(`📦 Using ${this.tests.length} fallback chemical tests`);

    } catch (error) {
      console.error('❌ Error loading database color tests:', error);
      this.tests = this.getFallbackTests();
    }
  }

  /**
   * تجميع الاختبارات حسب method_name
   * Group tests by method_name
   */
  private groupTests(): void {
    const groups = this.tests.reduce((acc, test) => {
      if (!acc[test.method_name]) {
        acc[test.method_name] = {
          method_name: test.method_name,
          method_name_ar: test.method_name_ar,
          test_type: test.test_type,
          test_number: test.test_number,
          reference: test.reference,
          prepare: test.prepare,
          prepare_ar: test.prepare_ar,
          results: [],
          total_results: 0
        };
      }

      acc[test.method_name].results.push({
        color_result: test.color_result,
        color_result_ar: test.color_result_ar,
        possible_substance: test.possible_substance,
        possible_substance_ar: test.possible_substance_ar
      });

      acc[test.method_name].total_results++;
      return acc;
    }, {} as Record<string, GroupedTest>);

    this.groupedTests = Object.values(groups);
  }

  /**
   * الحصول على جميع الاختبارات المجمعة
   * Get all grouped tests
   */
  async getGroupedTests(): Promise<GroupedTest[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return [...this.groupedTests];
  }

  /**
   * الحصول على اختبار محدد
   * Get specific test by method name
   */
  async getTestByMethodName(methodName: string): Promise<GroupedTest | null> {
    const tests = await this.getGroupedTests();
    return tests.find(test => test.method_name === methodName) || null;
  }

  /**
   * البحث في الاختبارات
   * Search tests
   */
  async searchTests(query: string): Promise<GroupedTest[]> {
    const tests = await this.getGroupedTests();
    const lowerQuery = query.toLowerCase();

    return tests.filter(test => 
      test.method_name.toLowerCase().includes(lowerQuery) ||
      test.method_name_ar.includes(query) ||
      test.results.some(result => 
        result.possible_substance.toLowerCase().includes(lowerQuery) ||
        result.possible_substance_ar.includes(query) ||
        result.color_result.toLowerCase().includes(lowerQuery) ||
        result.color_result_ar.includes(query)
      )
    );
  }

  /**
   * الحصول على إحصائيات الاختبارات
   * Get tests statistics
   */
  async getTestsStatistics(): Promise<{
    total_tests: number;
    total_results: number;
    unique_substances: number;
    unique_colors: number;
  }> {
    try {
      const tests = await this.getAllTests();

      if (!tests || !Array.isArray(tests)) {
        console.warn('⚠️ No tests data available for statistics');
        return {
          total_tests: 0,
          total_results: 0,
          unique_substances: 0,
          unique_colors: 0
        };
      }

      const allSubstances = new Set<string>();
      const allColors = new Set<string>();
      let totalResults = 0;

      tests.forEach(test => {
        // Safe access to color_results array from new format
        const colorResults = test.color_results || [];
        if (Array.isArray(colorResults)) {
          totalResults += colorResults.length;
          
          colorResults.forEach(result => {
            if (result) {
              const substance = result.possible_substance || '';
              const color = result.color_result || '';

              if (substance) allSubstances.add(substance);
              if (color) allColors.add(color);
            }
          });
        }
      });

      const statistics = {
        total_tests: tests.length,
        total_results: totalResults,
        unique_substances: allSubstances.size,
        unique_colors: allColors.size
      };

      console.log('📊 Database statistics calculated:', statistics);
      return statistics;

    } catch (error) {
      console.error('Error getting database statistics:', error);
      // Return safe default values
      return {
        total_tests: 0,
        total_results: 0,
        unique_substances: 0,
        unique_colors: 0
      };
    }
  }

  /**
   * بيانات احتياطية
   * Fallback data
   */
  private getFallbackTests(): DatabaseColorTest[] {
    return [
      {
        id: "marquis-test",
        method_name: "Marquis Test",
        method_name_ar: "اختبار ماركيز",
        color_result: "Purple to violet",
        color_result_ar: "بنفسجي إلى بنفسجي داكن",
        possible_substance: "Opium, Morphine, Heroin",
        possible_substance_ar: "الأفيون، المورفين، الهيروين",
        prepare: "1. Wear protective equipment.\n2. Place sample on spot plate.\n3. Add reagent.\n4. Observe color change.\n5. Dispose safely.",
        prepare_ar: "1. ارتدِ معدات الحماية.\n2. ضع العينة على الطبق.\n3. أضف الكاشف.\n4. راقب تغيير اللون.\n5. تخلص بأمان.",
        test_type: "F/L",
        test_number: "Test 1",
        reference: "Auterhoff, H., Braun, D.. Arch.Pharm.(Weinheim), 306 (1973) 866."
      }
    ];
  }

  /**
   * إعادة تحميل البيانات
   * Reload data
   */
  async reloadData(): Promise<void> {
    console.log('🔄 Reloading database color tests...');

    // Clear both localStorage keys
    localStorage.removeItem('database_color_tests');
    localStorage.removeItem('chemical_tests_data');

    // Reset state
    this.isInitialized = false;
    this.tests = [];
    this.groupedTests = [];

    // Force reload from JSON file
    try {
      const data = await import('@/data/Db.json');
      this.tests = data.chemical_tests || [];
      localStorage.setItem('chemical_tests_data', JSON.stringify(data));
      console.log(`🔄 Force reloaded ${this.tests.length} tests from JSON`);
    } catch (error) {
      console.error('Error force reloading:', error);
    }

    // Reload
    await this.initialize();
  }

  /**
   * حفظ الاختبارات إلى قاعدة البيانات
   * Save tests to database
   */
  async saveTests(tests: DatabaseColorTest[]): Promise<boolean> {
    try {
      console.log(`🔄 Saving ${tests.length} tests to database...`);

      // حفظ في localStorage أولاً
      const dataToSave = {
        chemical_tests: tests,
        last_updated: new Date().toISOString(),
        version: "1.0.0",
        total_tests: tests.length
      };

      localStorage.setItem('chemical_tests_data', JSON.stringify(dataToSave));
      console.log('✅ Saved to localStorage');

      // حفظ عبر API (إذا كان متاحاً)
      try {
        const response = await fetch('/api/tests/save-to-db', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tests }),
        });

        // Check if response is JSON (API available) or HTML (404 page)
        const contentType = response.headers.get('content-type');
        const isJsonResponse = contentType && contentType.includes('application/json');

        if (!isJsonResponse) {
          console.warn('⚠️ API not available (static export mode) - using localStorage only');
          // تحديث البيانات المحلية
          this.tests = tests;
          this.groupedTests = this.groupTestsByMethod(tests);
          return true; // Consider localStorage save as success
        }

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Saved to database files via API:', result);

          // تحديث البيانات المحلية
          this.tests = tests;
          this.groupedTests = this.groupTestsByMethod(tests);

          return true;
        } else {
          const error = await response.json();
          console.error('❌ API save failed:', error);
          throw new Error(error.error || 'Failed to save via API');
        }
      } catch (apiError: any) {
        console.error('❌ API save error:', apiError);

        // Check if it's a JSON parsing error (HTML response)
        if (apiError.message && apiError.message.includes('Unexpected token')) {
          console.warn('⚠️ API not available (static export mode) - using localStorage only');
          // تحديث البيانات المحلية
          this.tests = tests;
          this.groupedTests = this.groupTestsByMethod(tests);
          return true; // Consider localStorage save as success
        }

        // حتى لو فشل API، البيانات محفوظة في localStorage
        this.tests = tests;
        this.groupedTests = this.groupTestsByMethod(tests);
        return false;
      }

    } catch (error) {
      console.error('❌ Error saving tests:', error);
      return false;
    }
  }

  /**
   * إضافة اختبار جديد
   * Add new test
   */
  async addTest(test: Omit<DatabaseColorTest, 'id'>): Promise<string> {
    try {
      const newTest: DatabaseColorTest = {
        ...test,
        id: `test-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updatedTests = [...this.tests, newTest];
      const success = await this.saveTests(updatedTests);

      if (success) {
        console.log(`✅ Added new test: ${newTest.method_name}`);
        return newTest.id;
      } else {
        throw new Error('Failed to save new test');
      }
    } catch (error) {
      console.error('❌ Error adding test:', error);
      throw error;
    }
  }

  /**
   * تحديث اختبار موجود
   * Update existing test
   */
  async updateTest(updatedTest: DatabaseColorTest): Promise<boolean> {
    try {
      const testIndex = this.tests.findIndex(test => test.id === updatedTest.id);

      if (testIndex === -1) {
        throw new Error('Test not found');
      }

      const updatedTestWithTimestamp = {
        ...updatedTest,
        updated_at: new Date().toISOString()
      };

      const updatedTests = [...this.tests];
      updatedTests[testIndex] = updatedTestWithTimestamp;

      const success = await this.saveTests(updatedTests);

      if (success) {
        console.log(`✅ Updated test: ${updatedTest.method_name}`);
        return true;
      } else {
        throw new Error('Failed to save updated test');
      }
    } catch (error) {
      console.error('❌ Error updating test:', error);
      throw error;
    }
  }

  /**
   * حذف اختبار
   * Delete test
   */
  async deleteTest(testId: string): Promise<boolean> {
    try {
      const testIndex = this.tests.findIndex(test => test.id === testId);

      if (testIndex === -1) {
        throw new Error('Test not found');
      }

      const updatedTests = this.tests.filter(test => test.id !== testId);
      const success = await this.saveTests(updatedTests);

      if (success) {
        console.log(`✅ Deleted test: ${testId}`);
        return true;
      } else {
        throw new Error('Failed to save after deletion');
      }
    } catch (error) {
      console.error('❌ Error deleting test:', error);
      throw error;
    }
  }

  /**
   * إجبار إعادة التحميل - اختصار لـ reloadData
   * Force reload - shortcut for reloadData
   */
  async forceReload(): Promise<void> {
    return this.reloadData();
  }

  /**
   * إضافة اختبار جديد
   * Add new test
   */
  async addTest(test: DatabaseColorTest): Promise<void> {
    this.tests.push(test);
    this.groupTests();
    localStorage.setItem('database_color_tests', JSON.stringify(this.tests));
  }

  /**
   * تحديث اختبار
   * Update test
   */
  async updateTest(test: DatabaseColorTest): Promise<void> {
    const index = this.tests.findIndex(t => t.id === test.id);
    if (index !== -1) {
      this.tests[index] = test;
      this.groupTests();
      localStorage.setItem('database_color_tests', JSON.stringify(this.tests));
    }
  }

  /**
   * حذف اختبار
   * Delete test
   */
  async deleteTest(testId: string): Promise<void> {
    this.tests = this.tests.filter(t => t.id !== testId);
    this.groupTests();
    localStorage.setItem('database_color_tests', JSON.stringify(this.tests));
  }

  /**
   * الحصول على جميع الاختبارات
   * Get all tests
   */
  async getAllTests(): Promise<any[]> {
    await this.initialize();

    // إذا كانت البيانات محملة مباشرة من JSON الجديد (تحتوي على id و color_results)
    if (this.tests.length > 0 && this.tests[0].id && this.tests[0].color_results) {
      console.log(`📊 Returning ${this.tests.length} tests from new JSON format with color_results`);
      return this.tests.map(test => ({
        ...test,
        // تأكد من وجود color_results صالح
        color_results: Array.isArray(test.color_results) ? test.color_results.map(result => ({
          color_result: result.color_result || result.color || '',
          color_result_ar: result.color_result_ar || result.color_ar || '',
          possible_substance: result.possible_substance || result.substance || '',
          possible_substance_ar: result.possible_substance_ar || result.substance_ar || '',
          confidence_level: result.confidence_level || result.confidence || 'medium',
          color_hex: result.color_hex || '#000000'
        })) : []
      }));
    }

    // إذا كانت البيانات بالتنسيق القديم، استخدم groupedTests
    if (this.groupedTests.length > 0) {
      console.log(`📊 Returning ${this.groupedTests.length} tests from grouped format`);
      return this.groupedTests.map(test => ({
        id: test.method_name.toLowerCase().replace(/\s+/g, '-'),
        method_name: test.method_name,
        method_name_ar: test.method_name_ar,
        description: `Chemical test for ${test.method_name}`,
        description_ar: `اختبار كيميائي لـ ${test.method_name_ar}`,
        category: test.test_type || 'general',
        safety_level: 'medium',
        color_results: test.results.map(result => ({
          color_result: result.color_result || '',
          color_result_ar: result.color_result_ar || '',
          possible_substance: result.possible_substance || '',
          possible_substance_ar: result.possible_substance_ar || '',
          confidence_level: 'high',
          color_hex: '#000000'
        })),
        prepare: test.prepare,
        prepare_ar: test.prepare_ar,
        test_type: test.test_type,
        test_number: test.test_number,
        reference: test.reference,
        preparation_time: 5
      }));
    }

    console.warn('⚠️ No tests found in either format');
    return [];
  }

  /**
   * الحصول على اختبار بواسطة المعرف
   * Get test by ID
   */
  async getTestById(testId: string): Promise<any | null> {
    try {
      const tests = await this.getAllTests();

      // Direct ID match
      let test = tests.find(test => test.id === testId);
      if (test) {
        console.log(`🔍 Found test by direct ID: ${test.method_name} (${testId})`);
        return test;
      }

      // Test ID mapping for different naming conventions
      const testIdMapping: Record<string, string> = {
        'nitric-acid-test-heroin': 'nitric-acid-heroin-test',
        'nitric-acid-test-morphine': 'nitric-acid-morphine-test',
        'nitric-acid-test-codeine': 'nitric-acid-codeine-test',
        'modified-cobalt-thiocyanate': 'modified-cobalt-thiocyanate-test',
        'scott-test': 'modified-scott-test',
        'simon-test-acetone': 'simon-acetone-test',
        'zimmermann-test-pemoline': 'zimmermann-pemoline-test',
        '12-dinitrobenzene-test': 'dinitrobenzene-12-test',
        '13-dinitrobenzene-test': 'dinitrobenzene-13-test',
        '14-dinitrobenzene-test': 'dinitrobenzene-14-test',
        'zimmermann-test-diazepam': 'zimmermann-diazepam-test',
        'hydrochloric-acid-test-diazepam': 'hydrochloric-acid-diazepam-test',
        'cobalt-thiocyanate-test-methaqualone': 'cobalt-thiocyanate-methaqualone-test',
        'liebermann-test-mescaline': 'liebermann-mescaline-test',
        'marquis-test-psilocybine': 'marquis-psilocybine-test',
        'cobalt-thiocyanate-test-pcp': 'scott-pcp-test',
        'mecke-test-pcp': 'mecke-pcp-test'
      };

      // Try mapped ID
      if (testIdMapping[testId]) {
        test = tests.find(test => test.id === testIdMapping[testId]);
        if (test) {
          console.log(`🔍 Found test via mapping: ${test.method_name} (${testId} → ${test.id})`);
          return test;
        }
      }

      // Try alternative matching to prevent infinite loops
      test = tests.find(test =>
        test.id.includes(testId) ||
        testId.includes(test.id) ||
        test.method_name.toLowerCase().includes(testId.toLowerCase()) ||
        testId.toLowerCase().includes(test.method_name.toLowerCase())
      );

      if (test) {
        console.log(`🔍 Found test by alternative match: ${test.method_name} (${test.id}) for query: ${testId}`);
        return test;
      }

      console.warn(`⚠️ Test not found in database service: ${testId} (searched ${tests.length} tests)`);
      return null;

    } catch (error) {
      console.error(`❌ Error getting test by ID from database service: ${testId}`, error);
      return null;
    }
  }

  /**
   * البحث في الاختبارات
   * Search tests
   */
  async searchTests(query: string): Promise<any[]> {
    const tests = await this.getAllTests();
    const lowerQuery = query.toLowerCase();

    return tests.filter(test =>
      test.method_name.toLowerCase().includes(lowerQuery) ||
      test.method_name_ar.includes(query) ||
      test.description.toLowerCase().includes(lowerQuery) ||
      test.description_ar.includes(query)
    );
  }
}

export const databaseColorTestService = DatabaseColorTestService.getInstance();
export type { DatabaseColorTest, GroupedTest };
