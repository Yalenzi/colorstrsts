const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://colorstrsts-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function uploadTestsToFirebase() {
  try {
    console.log('🔄 بدء رفع الاختبارات إلى Firebase...');
    
    // Read the chemical tests data
    const testsPath = path.join(__dirname, '../src/data/chemical-tests.json');
    const testsData = JSON.parse(fs.readFileSync(testsPath, 'utf8'));
    
    console.log(`📊 تم العثور على ${testsData.length} اختبار في الملف`);
    
    // Upload each test to Firebase
    const batch = db.batch();
    let uploadCount = 0;
    
    for (const test of testsData) {
      const testRef = db.collection('tests').doc(test.id);
      
      // Prepare test data for Firebase
      const testData = {
        ...test,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        viewCount: Math.floor(Math.random() * 100) + 10,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
        difficulty: test.category || 'intermediate',
        subscriptionLevel: getSubscriptionLevel(test.category),
        tags: generateTags(test),
        equipment: generateEquipment(test),
        chemicals: generateChemicals(test),
        steps: generateSteps(test),
        expectedResults: generateExpectedResults(test),
        safetyNotes: generateSafetyNotes(test),
        references: [test.reference || 'Standard Chemical Analysis Reference']
      };
      
      batch.set(testRef, testData);
      uploadCount++;
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log(`✅ تم رفع ${uploadCount} اختبار إلى Firebase بنجاح`);
    console.log('🎉 انتهت عملية الرفع بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في رفع الاختبارات:', error);
  } finally {
    process.exit(0);
  }
}

function getSubscriptionLevel(category) {
  const levelMap = {
    'basic': 'free',
    'intermediate': 'basic',
    'advanced': 'premium',
    'expert': 'pro'
  };
  return levelMap[category] || 'basic';
}

function generateTags(test) {
  const tags = [];
  
  if (test.category) tags.push(test.category);
  if (test.test_type) tags.push(test.test_type);
  if (test.safety_level) tags.push(`safety_${test.safety_level}`);
  
  // Add substance-based tags
  if (test.possible_substance) {
    const substances = test.possible_substance.split(',').map(s => s.trim().toLowerCase());
    tags.push(...substances.slice(0, 3)); // Limit to 3 substance tags
  }
  
  return tags;
}

function generateEquipment(test) {
  const commonEquipment = [
    'Test tubes',
    'Spot plates',
    'Pipettes',
    'Beakers',
    'Stirring rods'
  ];
  
  const specialEquipment = {
    'high': ['Fume hood', 'Safety goggles', 'Gloves', 'Lab coat'],
    'medium': ['Safety goggles', 'Gloves'],
    'low': ['Basic safety equipment']
  };
  
  return [
    ...commonEquipment.slice(0, 3),
    ...(specialEquipment[test.safety_level] || specialEquipment['medium'])
  ];
}

function generateChemicals(test) {
  const chemicals = [];
  
  // Extract chemicals from preparation text
  if (test.prepare) {
    const prepText = test.prepare.toLowerCase();
    
    if (prepText.includes('sulfuric acid')) chemicals.push('Concentrated sulfuric acid');
    if (prepText.includes('nitric acid')) chemicals.push('Concentrated nitric acid');
    if (prepText.includes('hydrochloric acid')) chemicals.push('Hydrochloric acid');
    if (prepText.includes('sodium hydroxide')) chemicals.push('Sodium hydroxide solution');
    if (prepText.includes('potassium')) chemicals.push('Potassium compounds');
    if (prepText.includes('iodine')) chemicals.push('Iodine solution');
    if (prepText.includes('copper')) chemicals.push('Copper sulfate');
  }
  
  // Add default chemicals if none found
  if (chemicals.length === 0) {
    chemicals.push('Standard reagents', 'Distilled water');
  }
  
  return chemicals;
}

function generateSteps(test) {
  if (test.prepare) {
    return test.prepare.split('\n').filter(step => step.trim().length > 0);
  }
  
  return [
    'Prepare the sample',
    'Add reagents as specified',
    'Observe the reaction',
    'Record the results'
  ];
}

function generateExpectedResults(test) {
  const results = [];
  
  if (test.color_result) {
    results.push({
      type: 'color_change',
      description: test.color_result,
      descriptionAr: test.color_result_ar || test.color_result,
      colorHex: test.color_hex || '#000000'
    });
  }
  
  if (test.possible_substance) {
    results.push({
      type: 'substance_identification',
      description: `Indicates presence of: ${test.possible_substance}`,
      descriptionAr: `يشير إلى وجود: ${test.possible_substance_ar || test.possible_substance}`,
      confidence: test.confidence_level || 'medium'
    });
  }
  
  return results;
}

function generateSafetyNotes(test) {
  const safetyNotes = [];
  
  switch (test.safety_level) {
    case 'high':
      safetyNotes.push(
        'Use fume hood for all operations',
        'Wear full protective equipment',
        'Handle concentrated acids with extreme care',
        'Have emergency shower and eyewash readily available'
      );
      break;
    case 'medium':
      safetyNotes.push(
        'Wear safety goggles and gloves',
        'Work in well-ventilated area',
        'Handle chemicals with care'
      );
      break;
    case 'low':
      safetyNotes.push(
        'Wear basic safety equipment',
        'Follow standard laboratory procedures'
      );
      break;
    default:
      safetyNotes.push('Follow standard safety procedures');
  }
  
  return safetyNotes;
}

// Run the upload
uploadTestsToFirebase();
