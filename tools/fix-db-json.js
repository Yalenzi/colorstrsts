//!/usr/bin/env node

/**
 * Validate and fix public/data/Db.json
 * - Ensures required fields exist with sane defaults
 * - Normalizes arrays/strings
 * - Adds missing IDs where helpful
 *
 * Usage:
 *   node tools/fix-db-json.js
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'public', 'data', 'Db.json');

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60);
}

function ensureArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [v];
}

function ensureString(v, fallback = '') {
  return (typeof v === 'string' ? v : fallback).trim();
}

function ensureNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function withDefault(obj, key, fallback) {
  if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
    obj[key] = fallback;
  }
}

function fixColorResult(cr, idx) {
  const fixed = { ...cr };
  withDefault(fixed, 'color_result', '');
  withDefault(fixed, 'color_result_ar', '');
  withDefault(fixed, 'color_hex', '#000000');
  withDefault(fixed, 'possible_substance', '');
  withDefault(fixed, 'possible_substance_ar', '');
  withDefault(fixed, 'confidence_level', 'medium');
  if (!fixed.id) fixed.id = `cr-${idx + 1}-${slugify(fixed.color_result)}`;
  return fixed;
}

function fixComponent(c) {
  const fixed = { ...c };
  withDefault(fixed, 'name', '');
  withDefault(fixed, 'name_ar', '');
  if (fixed.formula === undefined) fixed.formula = '';
  if (fixed.concentration === undefined) fixed.concentration = '';
  return fixed;
}

function fixInstruction(ins, idx) {
  const fixed = { ...ins };
  withDefault(fixed, 'step_number', idx + 1);
  withDefault(fixed, 'instruction', '');
  withDefault(fixed, 'instruction_ar', '');
  if (fixed.safety_warning === undefined) fixed.safety_warning = '';
  if (fixed.safety_warning_ar === undefined) fixed.safety_warning_ar = '';
  if (fixed.icon === undefined) fixed.icon = 'ShieldCheckIcon';
  return fixed;
}

function fixTest(test, index) {
  const fixed = { ...test };

  // IDs and names
  withDefault(fixed, 'method_name', '');
  withDefault(fixed, 'method_name_ar', fixed.method_name);
  if (!fixed.id) fixed.id = `${slugify(fixed.method_name || 'test')}-${index + 1}`;

  // Descriptions
  withDefault(fixed, 'description', '');
  withDefault(fixed, 'description_ar', fixed.description);

  // Meta
  withDefault(fixed, 'category', 'basic');
  withDefault(fixed, 'safety_level', 'medium');
  fixed.preparation_time = ensureNumber(fixed.preparation_time, 5);
  withDefault(fixed, 'icon', 'BeakerIcon');
  withDefault(fixed, 'color_primary', '#8B5CF6');
  withDefault(fixed, 'created_at', new Date().toISOString());

  // Text blocks
  withDefault(fixed, 'prepare', '');
  withDefault(fixed, 'prepare_ar', fixed.prepare);

  // Types and references
  withDefault(fixed, 'test_type', 'L');
  withDefault(fixed, 'test_number', `Test ${index + 1}`);
  withDefault(fixed, 'reference', 'Standard Methods for Chemical Analysis (2025).');

  // Arrays
  fixed.chemical_components = ensureArray(fixed.chemical_components).map(fixComponent);
  fixed.instructions = ensureArray(fixed.instructions).map(fixInstruction);
  fixed.color_results = ensureArray(fixed.color_results).map(fixColorResult);

  return fixed;
}

function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ Not found: ${DB_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_PATH, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error('❌ Invalid JSON in public/data/Db.json');
    console.error(e.message);
    process.exit(1);
  }

  const tests = ensureArray(json.chemical_tests);
  if (tests.length === 0) {
    console.warn('⚠️ No tests found in Db.json (chemical_tests is empty)');
  }

  const fixedTests = tests.map((t, i) => fixTest(t, i));

  const out = {
    chemical_tests: fixedTests,
    last_updated: new Date().toISOString(),
    version: json.version || '1.0.0',
    total_tests: fixedTests.length,
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(out, null, 2));
  console.log(`✅ Fixed and saved ${fixedTests.length} tests to public/data/Db.json`);
  console.log('💡 Next: Open Admin > Tests Management and click Save to sync to Firestore.');
}

main();

