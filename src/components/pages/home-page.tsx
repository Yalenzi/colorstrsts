'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { databaseColorTestService } from '@/lib/database-color-test-service';
import {
  BeakerIcon,
  LanguageIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  SparklesIcon,
  GlobeAltIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface HomePageProps {
  lang: Language;
}

export function HomePage({ lang }: HomePageProps) {
  const t = getTranslationsSync(lang);
  const isRTL = lang === 'ar';

  // State for dynamic statistics
  const [stats, setStats] = useState({
    totalTests: 35,
    totalResults: 150,
    languages: 2,
    accuracy: '100%'
  });

  // Load real statistics with force reload
  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log('🔄 Force reloading database service for homepage stats...');
        await databaseColorTestService.forceReload();
        const tests = await databaseColorTestService.getAllTests();
        const statistics = await databaseColorTestService.getTestsStatistics();

        setStats({
          totalTests: tests.length || 39,
          totalResults: statistics.total_results || 200,
          languages: 2,
          accuracy: '100%'
        });

        console.log(`📊 Homepage stats loaded: ${tests.length} tests, ${statistics.total_results} results`);
      } catch (error) {
        console.error('Error loading homepage statistics:', error);
        // Keep updated default values on error
        setStats({
          totalTests: 39,
          totalResults: 200,
          languages: 2,
          accuracy: '100%'
        });
      }
    };

    loadStats();
  }, []);

  const features = [
    {
      icon: BeakerIcon,
      title: t('home.features.comprehensive_tests'),
      description: t('home.features.comprehensive_tests_desc'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: GlobeAltIcon,
      title: t('home.features.bilingual_support'),
      description: t('home.features.bilingual_support_desc'),
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      icon: ShieldCheckIcon,
      title: t('home.features.safety_first'),
      description: t('home.features.safety_first_desc'),
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      icon: DocumentTextIcon,
      title: t('home.features.professional_reports'),
      description: t('home.features.professional_reports_desc'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  const statsDisplay = [
    { number: stats.totalTests.toString(), label: lang === 'ar' ? 'اختبار متاح' : 'Available Tests' },
    { number: stats.totalResults.toString(), label: lang === 'ar' ? 'نتيجة لونية' : 'Color Results' },
    { number: stats.languages.toString(), label: lang === 'ar' ? 'لغة مدعومة' : 'Languages Supported' },
    { number: stats.accuracy, label: lang === 'ar' ? 'دقة علمية' : 'Scientific Accuracy' },
  ];

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section - Scientific Laboratory Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950">
        {/* Scientific Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        {/* Laboratory Equipment Background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full opacity-10 animate-pulse-scientific"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-full opacity-10 animate-pulse-scientific" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 bg-gradient-to-br from-success-200 to-success-300 rounded-full opacity-10 animate-pulse-scientific" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Scientific Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 text-primary-800 dark:text-primary-200 text-sm font-semibold mb-8 border border-primary-200 dark:border-primary-700 shadow-lg">
              <SparklesIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 animate-glow" />
              {lang === 'ar' ? 'تقنية مختبرية متقدمة - الإصدار 2.0' : 'Advanced Laboratory Technology - Version 2.0'}
            </div>

            {/* Main Heading - Scientific Typography */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
              <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-700 bg-clip-text text-transparent">
                {t('home.title')}
              </span>
            </h1>

            {/* Scientific Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto font-medium">
              {t('home.subtitle')}
            </p>

            {/* Scientific Description */}
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.description')}
            </p>

            {/* Scientific Metrics */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="precision-indicator precision-high">
                <BeakerIcon className="h-4 w-4" />
                <span>{lang === 'ar' ? 'دقة +99%' : '99%+ Accuracy'}</span>
              </div>
              <div className="precision-indicator confidence-excellent">
                <ShieldCheckIcon className="h-4 w-4" />
                <span>{lang === 'ar' ? 'موثوق علمياً' : 'Scientifically Validated'}</span>
              </div>
              <div className="precision-indicator confidence-good">
                <GlobeAltIcon className="h-4 w-4" />
                <span>{lang === 'ar' ? 'معتمد دولياً' : 'Internationally Certified'}</span>
              </div>
            </div>

            {/* Scientific CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href={`/${lang}/tests`} className="group">
                <Button size="xl" variant="scientific" className="shadow-2xl hover:shadow-glow transition-all duration-300 transform hover:scale-105">
                  <span className="flex items-center">
                    <BeakerIcon className="h-6 w-6 mr-3 rtl:ml-3 rtl:mr-0" />
                    {t('home.get_started')}
                    <ArrowRightIcon className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>

              <Link href={`/${lang}/tests/image-analysis`} className="group">
                <Button size="xl" variant="precision" className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <span className="flex items-center">
                    <DocumentTextIcon className="h-6 w-6 mr-3 rtl:ml-3 rtl:mr-0" />
                    {lang === 'ar' ? 'تحليل الصور المتقدم' : 'Advanced Image Analysis'}
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Stats Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {lang === 'ar' ? 'إحصائيات النظام العلمية' : 'Scientific System Statistics'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {lang === 'ar'
                ? 'أرقام تعكس دقة وموثوقية النظام المختبري المتقدم'
                : 'Numbers reflecting the precision and reliability of our advanced laboratory system'
              }
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsDisplay.map((stat, index) => (
              <div key={index} className="lab-card text-center p-6 hover:scale-105 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-3 text-precision">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
                <div className="mt-3 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full opacity-60"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scientific Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 text-primary-800 dark:text-primary-200 text-sm font-semibold mb-6">
              <ShieldCheckIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {lang === 'ar' ? 'تقنيات مختبرية متقدمة' : 'Advanced Laboratory Technologies'}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {lang === 'ar'
                ? 'منصة علمية متكاملة تجمع بين أحدث التقنيات المختبرية والذكاء الاصطناعي لتوفير نتائج دقيقة وموثوقة'
                : 'Integrated scientific platform combining cutting-edge laboratory technologies with AI for precise and reliable results'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="lab-equipment text-center p-8 group hover:scale-105 transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="precision-indicator confidence-good">
                    <SparklesIcon className="h-4 w-4" />
                    <span>{lang === 'ar' ? 'متقدم' : 'Advanced'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {lang === 'ar' ? 'ابدأ الاختبار الآن' : 'Start Testing Now'}
            </h2>
            <Link href={`/${lang}/tests`} className="group">
              <Button size="xl" className="bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl transition-all duration-200">
                <span className="flex items-center">
                  <BeakerIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t('home.get_started')}
                  <ArrowRightIcon className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
