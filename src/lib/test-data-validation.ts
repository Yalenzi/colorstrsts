/**
 * Test Data Validation Service
 * خدمة التحقق من صحة بيانات الاختبارات
 */

import databaseData from '@/data/Db.json';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalTests: number;
    totalColorResults: number;
    totalChemicalComponents: number;
    testsWithInstructions: number;
  };
}

/**
 * Validate the database structure and data
 * التحقق من صحة بنية قاعدة البيانات والبيانات
 */
export function validateDatabaseData(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let totalColorResults = 0;
  let totalChemicalComponents = 0;
  let testsWithInstructions = 0;

  // Check if database has chemical_tests array
  if (!databaseData.chemical_tests || !Array.isArray(databaseData.chemical_tests)) {
    errors.push('Database missing chemical_tests array');
    return {
      isValid: false,
      errors,
      warnings,
      summary: {
        totalTests: 0,
        totalColorResults: 0,
        totalChemicalComponents: 0,
        testsWithInstructions: 0
      }
    };
  }

  // Validate each test
  databaseData.chemical_tests.forEach((test: any, index: number) => {
    const testPrefix = `Test ${index + 1} (${test.id || 'no-id'})`;

    // Required fields
    if (!test.id) errors.push(`${testPrefix}: Missing id`);
    if (!test.method_name) errors.push(`${testPrefix}: Missing method_name`);
    if (!test.method_name_ar) errors.push(`${testPrefix}: Missing method_name_ar`);
    if (!test.description) warnings.push(`${testPrefix}: Missing description`);
    if (!test.description_ar) warnings.push(`${testPrefix}: Missing description_ar`);

    // Chemical components
    if (test.chemical_components && Array.isArray(test.chemical_components)) {
      totalChemicalComponents += test.chemical_components.length;
      test.chemical_components.forEach((component: any, compIndex: number) => {
        if (!component.name) errors.push(`${testPrefix} Component ${compIndex + 1}: Missing name`);
        if (!component.name_ar) warnings.push(`${testPrefix} Component ${compIndex + 1}: Missing name_ar`);
      });
    } else {
      warnings.push(`${testPrefix}: No chemical_components found`);
    }

    // Color results
    if (test.color_results && Array.isArray(test.color_results)) {
      totalColorResults += test.color_results.length;
      test.color_results.forEach((result: any, resultIndex: number) => {
        const resultPrefix = `${testPrefix} Color Result ${resultIndex + 1}`;
        
        if (!result.color_result) errors.push(`${resultPrefix}: Missing color_result`);
        if (!result.color_result_ar) warnings.push(`${resultPrefix}: Missing color_result_ar`);
        if (!result.color_hex) errors.push(`${resultPrefix}: Missing color_hex`);
        if (!result.possible_substance) errors.push(`${resultPrefix}: Missing possible_substance`);
        if (!result.possible_substance_ar) warnings.push(`${resultPrefix}: Missing possible_substance_ar`);
        if (!result.confidence_level) warnings.push(`${resultPrefix}: Missing confidence_level`);

        // Validate hex color format
        if (result.color_hex && !/^#[0-9A-Fa-f]{6}$/.test(result.color_hex)) {
          errors.push(`${resultPrefix}: Invalid color_hex format (${result.color_hex})`);
        }
      });
    } else {
      warnings.push(`${testPrefix}: No color_results found`);
    }

    // Instructions
    if (test.instructions && Array.isArray(test.instructions)) {
      testsWithInstructions++;
      test.instructions.forEach((instruction: any, instIndex: number) => {
        const instPrefix = `${testPrefix} Instruction ${instIndex + 1}`;
        
        if (!instruction.instruction) errors.push(`${instPrefix}: Missing instruction`);
        if (!instruction.instruction_ar) warnings.push(`${instPrefix}: Missing instruction_ar`);
        if (!instruction.safety_warning) warnings.push(`${instPrefix}: Missing safety_warning`);
        if (!instruction.safety_warning_ar) warnings.push(`${instPrefix}: Missing safety_warning_ar`);
      });
    }

    // Preparation instructions
    if (!test.prepare) warnings.push(`${testPrefix}: Missing prepare instructions`);
    if (!test.prepare_ar) warnings.push(`${testPrefix}: Missing prepare_ar instructions`);
  });

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    summary: {
      totalTests: databaseData.chemical_tests.length,
      totalColorResults,
      totalChemicalComponents,
      testsWithInstructions
    }
  };
}

/**
 * Get a summary of the database content
 * الحصول على ملخص محتوى قاعدة البيانات
 */
export function getDatabaseSummary() {
  const validation = validateDatabaseData();
  
  console.log('📊 Database Summary:');
  console.log(`   Tests: ${validation.summary.totalTests}`);
  console.log(`   Color Results: ${validation.summary.totalColorResults}`);
  console.log(`   Chemical Components: ${validation.summary.totalChemicalComponents}`);
  console.log(`   Tests with Instructions: ${validation.summary.testsWithInstructions}`);
  
  if (validation.errors.length > 0) {
    console.error('❌ Errors:', validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warnings:', validation.warnings);
  }
  
  if (validation.isValid) {
    console.log('✅ Database validation passed');
  } else {
    console.error('❌ Database validation failed');
  }
  
  return validation;
}

/**
 * Test specific functionality
 * اختبار وظائف محددة
 */
export function testDataAccess() {
  try {
    // Test getting a specific test
    const firstTest = databaseData.chemical_tests[0];
    console.log('🧪 First test:', firstTest?.method_name);
    
    // Test color results access
    const firstColorResult = firstTest?.color_results?.[0];
    console.log('🎨 First color result:', firstColorResult?.color_result);
    
    // Test chemical components access
    const firstComponent = firstTest?.chemical_components?.[0];
    console.log('⚗️ First chemical component:', firstComponent?.name);
    
    return true;
  } catch (error) {
    console.error('❌ Data access test failed:', error);
    return false;
  }
}
