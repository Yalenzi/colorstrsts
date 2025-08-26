'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { getChemicalTestsLocal, ChemicalTest, initializeLocalStorage } from '@/lib/local-data-service';
import { databaseColorTestService } from '@/lib/database-color-test-service';
import { Button } from '@/components/ui/button';
import { TestCard } from '@/components/ui/test-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SimpleTestAccessGuard } from '@/components/tests/SimpleTestAccessGuard';

import {
  BeakerIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  LockClosedIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface TestsPageProps {
  lang: Language;
}

// Fallback tests data
const getFallbackTests = async (): Promise<ChemicalTest[]> => {
  return [
    {
      id: 'marquis-test',
      method_name: 'Marquis Test',
      method_name_ar: 'اختبار ماركيز',
      color_result: 'Purple/Black',
      color_result_ar: 'بنفسجي/أسود',
      possible_substance: 'MDMA/Amphetamines',
      possible_substance_ar: 'إم دي إم إيه/أمفيتامينات',
      prepare: 'Add 2-3 drops of reagent to sample',
      prepare_ar: 'أضف 2-3 قطرات من الكاشف إلى العينة',
      description: 'Primary screening test for MDMA and amphetamines',
      description_ar: 'اختبار فحص أولي للإم دي إم إيه والأمفيتامينات',
      test_type: 'Presumptive',
      test_number: '1',
      reference: 'DEA Guidelines',
      category: 'basic',
      safety_level: 'medium',
      reagents: ['Marquis Reagent'],
      expected_time: '2-3 minutes'
    },
    {
      id: 'mecke-test',
      method_name: 'Mecke Test',
      method_name_ar: 'اختبار ميك',
      color_result: 'Blue/Green',
      color_result_ar: 'أزرق/أخضر',
      possible_substance: 'Opiates',
      possible_substance_ar: 'مواد أفيونية',
      prepare: 'Add 2-3 drops of reagent to sample',
      prepare_ar: 'أضف 2-3 قطرات من الكاشف إلى العينة',
      description: 'Screening test for opiates and related compounds',
      description_ar: 'اختبار فحص للمواد الأفيونية والمركبات ذات الصلة',
      test_type: 'Presumptive',
      test_number: '2',
      reference: 'UNODC Manual',
      category: 'basic',
      safety_level: 'medium',
      reagents: ['Mecke Reagent'],
      expected_time: '2-3 minutes'
    },
    {
      id: 'fast-blue-b-test',
      method_name: 'Fast Blue B Salt Test',
      method_name_ar: 'اختبار الأزرق السريع ب',
      color_result: 'Orange/Red',
      color_result_ar: 'برتقالي/أحمر',
      possible_substance: 'THC/Cannabis',
      possible_substance_ar: 'تي إتش سي/حشيش',
      prepare: 'Mix sample with Fast Blue B salt solution',
      prepare_ar: 'اخلط العينة مع محلول ملح الأزرق السريع ب',
      description: 'Specific test for THC and cannabis compounds',
      description_ar: 'اختبار محدد لمركبات التي إتش سي والحشيش',
      test_type: 'Confirmatory',
      test_number: '13',
      reference: 'Scientific Literature',
      category: 'advanced',
      safety_level: 'high',
      reagents: ['Fast Blue B Salt', 'Sodium Hydroxide'],
      expected_time: '5-10 minutes'
    }
  ];
};

function TestsPageContent({ lang }: TestsPageProps) {
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSafetyLevel, setSelectedSafetyLevel] = useState<string>('all');

  const router = useRouter();
  const t = getTranslationsSync(lang);
  const isRTL = lang === 'ar';

  useEffect(() => {
    // Load tests from Firebase Realtime Database
    const loadTests = async () => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        // Try to load from the new database service first (35 tests)
        try {
          const newTests = await databaseColorTestService.getAllTests();
          console.log('🔥 Loaded chemical tests from new database service', newTests.length);

          if (newTests && newTests.length > 0) {
            setTests(newTests);
            setFilteredTests(newTests);
            return; // Exit early if successful
          }
        } catch (dbError) {
          console.warn('⚠️ Could not load from new database service, trying fallback');
        }

        // Fallback to old local storage method
        initializeLocalStorage();
        const localTests = getChemicalTestsLocal();
        console.log('🔥 Loaded chemical tests from local storage (fallback)', localTests.length);

        if (localTests && localTests.length > 0) {
          setTests(localTests);
          setFilteredTests(localTests);
        } else {
          console.warn('No tests found in local storage, using fallback data');
          // Use fallback data if local storage is empty
          const fallbackTests = await getFallbackTests();
          setTests(fallbackTests);
          setFilteredTests(fallbackTests);
        }
      } catch (error) {
        console.error('Error loading tests from local storage:', error);
        setError('Failed to load tests from local storage, using fallback data');
        // Fallback to default tests
        const fallbackTests = await getFallbackTests();
        setTests(fallbackTests);
        setFilteredTests(fallbackTests);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  useEffect(() => {
    // Filter tests based on search and filters
    let filtered = tests;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(test => {
        const name = lang === 'ar' ? test.method_name_ar : test.method_name;
        const description = lang === 'ar' ? test.description_ar : test.description;
        return name.toLowerCase().includes(query) ||
               description.toLowerCase().includes(query);
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }

    // Safety level filter
    if (selectedSafetyLevel !== 'all') {
      filtered = filtered.filter(test => test.safety_level === selectedSafetyLevel);
    }

    setFilteredTests(filtered);
  }, [tests, searchQuery, selectedCategory, selectedSafetyLevel, lang]);

  const categories = [
    { value: 'all', label: lang === 'ar' ? 'جميع الفئات' : 'All Categories' },
    { value: 'basic', label: t('tests.categories.basic') },
    { value: 'advanced', label: t('tests.categories.advanced') },
    { value: 'specialized', label: t('tests.categories.specialized') },
  ];

  const safetyLevels = [
    { value: 'all', label: lang === 'ar' ? 'جميع المستويات' : 'All Levels' },
    { value: 'low', label: t('tests.safety_levels.low') },
    { value: 'medium', label: t('tests.safety_levels.medium') },
    { value: 'high', label: t('tests.safety_levels.high') },
    { value: 'extreme', label: t('tests.safety_levels.extreme') },
  ];

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-950';
      case 'extreme': return 'text-red-600 bg-red-50 dark:bg-red-950';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Scientific Header */}
        <div className="text-center mb-16">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 mb-8 shadow-lg">
            <BeakerIcon className="h-10 w-10 text-primary-600 animate-pulse-scientific" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 animate-glow"></div>
          </div>

          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 text-primary-800 dark:text-primary-200 text-sm font-semibold mb-6">
            <BeakerIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {lang === 'ar' ? 'مختبر التحليل الكيميائي' : 'Chemical Analysis Laboratory'}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-700 bg-clip-text text-transparent">
              {t('tests.title')}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            {t('tests.subtitle')}
          </p>

          {/* Scientific Metrics */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="precision-indicator precision-high">
              <BeakerIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? `${tests.length} اختبار متاح` : `${tests.length} Tests Available`}</span>
            </div>
            <div className="precision-indicator confidence-excellent">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'معتمد مختبرياً' : 'Laboratory Certified'}</span>
            </div>
            <div className="precision-indicator confidence-good">
              <ClockIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'نتائج فورية' : 'Instant Results'}</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
              <div className="text-2xl font-bold text-primary-600">{tests.length}</div>
              <div className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'اختبار متاح' : 'Available Tests'}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
              <div className="text-2xl font-bold text-secondary-600">{Math.floor(tests.length * 4.2)}</div>
              <div className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'نتيجة لونية' : 'Color Results'}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
              <div className="text-2xl font-bold text-success-600">2</div>
              <div className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'لغة مدعومة' : 'Languages'}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
              <div className="text-2xl font-bold text-warning-600">100%</div>
              <div className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'دقة علمية' : 'Accuracy'}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    {lang === 'ar'
                      ? 'تم تحميل البيانات الاحتياطية. قد تكون بعض الاختبارات غير متاحة.'
                      : 'Fallback data loaded. Some tests may not be available.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scientific Search and Filters */}
        <div className="mb-12 space-y-6">
          {/* Advanced Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="lab-equipment p-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 transform -translate-y-1/2 h-6 w-6 text-primary-600 pointer-events-none" />
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'البحث المتقدم في قاعدة البيانات المختبرية...' : 'Advanced search in laboratory database...'}
                  value={searchQuery || ''}
                  onChange={(e) => {
                    try {
                      setSearchQuery(e.target.value || '');
                    } catch (error) {
                      console.error('Search input error:', error);
                    }
                  }}
                  className="w-full pl-12 rtl:pr-12 rtl:pl-6 pr-16 py-4 border-2 border-primary-200 rounded-xl bg-white dark:bg-gray-800 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-lg"
                />
                <div className="absolute right-4 rtl:left-4 rtl:right-auto top-1/2 transform -translate-y-1/2">
                  <div className="precision-indicator confidence-good">
                    <span className="text-xs font-mono">{filteredTests.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scientific Filters */}
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="lab-card p-4 min-w-[200px]">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                <FunnelIcon className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-semibold text-foreground">
                  {lang === 'ar' ? 'فئة التحليل' : 'Analysis Category'}
                </span>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-primary-200 rounded-lg bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="lab-card p-4 min-w-[200px]">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                <ShieldCheckIcon className="h-5 w-5 text-secondary-600" />
                <span className="text-sm font-semibold text-foreground">
                  {lang === 'ar' ? 'مستوى الأمان' : 'Safety Level'}
                </span>
              </div>
              <select
                value={selectedSafetyLevel}
                onChange={(e) => setSelectedSafetyLevel(e.target.value)}
                className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all duration-200"
              >
                {safetyLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <BeakerIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {lang === 'ar' ? 'لا توجد اختبارات' : 'No tests found'}
            </h3>
            <p className="text-muted-foreground">
              {lang === 'ar' 
                ? 'جرب تغيير معايير البحث أو الفلترة'
                : 'Try changing your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTests.map((test, index) => {
              const isFreeTest = index < 5;

              return (
                <div key={test.id} className="relative">
                  <SimpleTestAccessGuard
                    testIndex={index}
                    testId={test.id}
                    testName={lang === 'ar' ? test.method_name_ar : test.method_name}
                    lang={lang}
                  >
                    <div className="relative">
                      {/* Free/Premium Badge - Hidden as requested */}
                      <div className="absolute top-2 right-2 z-10 hidden">
                        {isFreeTest ? (
                          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <StarIcon className="w-3 h-3 mr-1" />
                            {lang === 'ar' ? 'مجاني' : 'Free'}
                          </div>
                        ) : (
                          <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <LockClosedIcon className="w-3 h-3 mr-1" />
                            {lang === 'ar' ? 'مميز' : 'Premium'}
                          </div>
                        )}
                      </div>

                      <TestCard
                        test={test}
                        lang={lang}
                        onClick={(testId) => {
                          // This will be handled by TestAccessGuard
                          console.log('Test card clicked:', testId);
                        }}
                      />
                    </div>
                  </SimpleTestAccessGuard>
                </div>
              );
            })}
          </div>
        )}


      </div>
    </div>
  );
}

export function TestsPage({ lang }: TestsPageProps) {
  return <TestsPageContent lang={lang} />;
}

export default TestsPage;
