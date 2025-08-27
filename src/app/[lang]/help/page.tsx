import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface HelpPageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Language }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: lang === 'ar' ? 'المساعدة' : 'Help',
    description: lang === 'ar' 
      ? 'دليل المساعدة لاستخدام نظام اختبارات الألوان للكشف عن المخدرات'
      : 'Help guide for using the color testing system for drug detection',
  };
}

export default async function Help({ params }: HelpPageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {lang === 'ar' ? 'المساعدة' : 'Help'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {lang === 'ar' 
                ? 'دليل شامل لاستخدام نظام اختبارات الألوان'
                : 'Comprehensive guide to using the color testing system'
              }
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {lang === 'ar' ? 'كيفية البدء' : 'Getting Started'}
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {lang === 'ar' 
                    ? '1. اختر نوع الاختبار المناسب من صفحة الاختبارات'
                    : '1. Choose the appropriate test type from the tests page'
                  }
                </p>
                <p>
                  {lang === 'ar' 
                    ? '2. اقرأ تعليمات السلامة بعناية'
                    : '2. Read the safety instructions carefully'
                  }
                </p>
                <p>
                  {lang === 'ar' 
                    ? '3. اتبع خطوات الاختبار المحددة'
                    : '3. Follow the specified test steps'
                  }
                </p>
                <p>
                  {lang === 'ar' 
                    ? '4. اختر اللون المُلاحظ بعد إضافة الكاشف'
                    : '4. Select the observed color after adding the reagent'
                  }
                </p>
                <p>
                  {lang === 'ar' 
                    ? '5. احفظ النتائج للمراجعة اللاحقة'
                    : '5. Save results for later review'
                  }
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {lang === 'ar' 
                      ? 'ما مدى دقة النتائج؟'
                      : 'How accurate are the results?'
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {lang === 'ar' 
                      ? 'النتائج تقديرية وتحتاج تأكيد مخبري متخصص للحصول على نتائج نهائية.'
                      : 'Results are preliminary and require specialized laboratory confirmation for final results.'
                    }
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {lang === 'ar' 
                      ? 'هل يمكنني استخدام النظام بدون خبرة مسبقة؟'
                      : 'Can I use the system without prior experience?'
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {lang === 'ar' 
                      ? 'هذا النظام مخصص للمتخصصين المدربين في بيئة مختبرية آمنة.'
                      : 'This system is designed for trained professionals in a safe laboratory environment.'
                    }
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {lang === 'ar' 
                      ? 'كيف أحفظ النتائج؟'
                      : 'How do I save results?'
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {lang === 'ar' 
                      ? 'انقر على زر "حفظ النتيجة" في صفحة النتائج، ويمكنك مراجعتها في صفحة النتائج.'
                      : 'Click the "Save Result" button on the results page, and you can review them in the results page.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {lang === 'ar' ? 'الدعم التقني' : 'Technical Support'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {lang === 'ar'
                  ? 'إذا واجهت أي مشاكل تقنية، يرجى التواصل معنا:'
                  : 'If you encounter any technical issues, please contact us:'
                }
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                      {lang === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}
                    </p>
                    <a href="mailto:aburakan4551@gmail.com" className="text-primary-600 hover:text-primary-700 font-medium">
                      aburakan4551@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
                  <svg className="h-5 w-5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      {lang === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}
                    </p>
                    <a href="mailto:ftaksa@hotmail.com" className="text-secondary-600 hover:text-secondary-700 font-medium">
                      ftaksa@hotmail.com
                    </a>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>{lang === 'ar' ? 'ملاحظة:' : 'Note:'}</strong> {' '}
                    {lang === 'ar'
                      ? 'نلتزم بالرد على استفساراتكم خلال 24-48 ساعة من تاريخ الاستلام'
                      : 'We commit to responding to your inquiries within 24-48 hours of receipt'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
