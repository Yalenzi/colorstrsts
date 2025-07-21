// مولد البيانات التجريبية لاختبار لوحة الإدارة

export function generateMockTestResults() {
  const testIds = [
    'marquis-test',
    'mecke-test',
    'ehrlich-test',
    'simon-test',
    'fast-blue-b-test',
    'duquenois-levine-test',
    'cobalt-thiocyanate-test',
    'ferric-sulfate-test',
    'nitric-acid-test',
    'liebermann-test'
  ];

  const users = [
    'أحمد محمد',
    'سارة أحمد', 
    'عمر خالد',
    'فاطمة علي',
    'محمد حسن',
    'نور الدين',
    'ليلى سالم',
    'يوسف إبراهيم'
  ];

  const results = [];
  
  // إنشاء 50 نتيجة تجريبية
  for (let i = 0; i < 50; i++) {
    const testId = testIds[Math.floor(Math.random() * testIds.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    
    results.push({
      id: `test-result-${i + 1}`,
      testId,
      user,
      timestamp,
      result: 'completed',
      isPremium: Math.random() > 0.7
    });
  }

  return results;
}

export function saveMockDataToLocalStorage() {
  if (typeof window === 'undefined') return;

  try {
    const existingData = localStorage.getItem('test_results');
    if (!existingData || JSON.parse(existingData).length < 10) {
      const mockResults = generateMockTestResults();
      localStorage.setItem('test_results', JSON.stringify(mockResults));
      console.log('✅ Mock test results saved to localStorage');
    }
  } catch (error) {
    console.error('Error saving mock data:', error);
  }
}

// استدعاء الدالة عند تحميل الصفحة
if (typeof window !== 'undefined') {
  saveMockDataToLocalStorage();
}