import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface SafetyPageProps {
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
    title: lang === 'ar' ? 'إرشادات السلامة' : 'Safety Guidelines',
    description: lang === 'ar' 
      ? 'إرشادات السلامة المهمة لاستخدام الكواشف الكيميائية في اختبارات الألوان'
      : 'Important safety guidelines for using chemical reagents in color testing',
  };
}

export default async function Safety({ params }: SafetyPageProps) {
  const { lang } = await params;

  const safetyRules = [
    {
      ar: 'استخدم القفازات المقاومة للمواد الكيميائية دائماً',
      en: 'Always use chemical-resistant gloves'
    },
    {
      ar: 'تأكد من التهوية الممتازة أو استخدم خزانة الأبخرة',
      en: 'Ensure excellent ventilation or use a fume hood'
    },
    {
      ar: 'لا تلمس الكواشف مباشرة - قد تسبب حروق شديدة',
      en: 'Do not touch reagents directly - may cause severe burns'
    },
    {
      ar: 'احتفظ بالكواشف بعيداً عن الأطفال والمواد القابلة للاشتعال',
      en: 'Keep reagents away from children and flammable materials'
    },
    {
      ar: 'اتبع إجراءات التخلص الآمن للنفايات الكيميائية',
      en: 'Follow safe disposal procedures for chemical waste'
    },
    {
      ar: 'هذه الاختبارات للمتخصصين المدربين فقط في بيئة مختبرية آمنة',
      en: 'These tests are for trained professionals only in a safe laboratory environment'
    }
  ];

  const emergencySteps = [
    {
      ar: 'في حالة ملامسة الجلد: اغسل فوراً بالماء البارد لمدة 15 دقيقة',
      en: 'In case of skin contact: Immediately wash with cold water for 15 minutes'
    },
    {
      ar: 'في حالة ملامسة العين: اغسل بالماء الجاري لمدة 15 دقيقة واطلب المساعدة الطبية',
      en: 'In case of eye contact: Rinse with running water for 15 minutes and seek medical help'
    },
    {
      ar: 'في حالة الاستنشاق: انتقل إلى الهواء الطلق فوراً',
      en: 'In case of inhalation: Move to fresh air immediately'
    },
    {
      ar: 'في حالة البلع: لا تحفز القيء واطلب المساعدة الطبية فوراً',
      en: 'In case of ingestion: Do not induce vomiting and seek medical help immediately'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-6">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {lang === 'ar' ? 'إرشادات السلامة' : 'Safety Guidelines'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {lang === 'ar' 
                ? 'تعليمات السلامة الحرجة للعمل مع الكواشف الكيميائية'
                : 'Critical safety instructions for working with chemical reagents'
              }
            </p>
          </div>

          {/* Critical Warning */}
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">
                  {lang === 'ar' ? 'تحذير هام' : 'Important Warning'}
                </h2>
                <p className="text-red-700 dark:text-red-300">
                  {lang === 'ar' 
                    ? 'هذا النظام مخصص للمتخصصين المدربين فقط. الكواشف الكيميائية خطيرة ويجب التعامل معها بحذر شديد في بيئة مختبرية مناسبة.'
                    : 'This system is for trained professionals only. Chemical reagents are dangerous and must be handled with extreme caution in an appropriate laboratory environment.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* المكونات الكيميائية - Chemical Components */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-purple-500 mb-8">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {lang === 'ar' ? 'المكونات الكيميائية' : 'Chemical Components'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-purple-700 dark:text-purple-300">
                  {lang === 'ar' ? 'الكواشف الأساسية' : 'Primary Reagents'}
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>{lang === 'ar' ? 'كاشف ماركيز (Marquis)' : 'Marquis Reagent'}</span>
                  </li>
                  <li className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>{lang === 'ar' ? 'كاشف إيرليش (Ehrlich)' : 'Ehrlich Reagent'}</span>
                  </li>
                  <li className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>{lang === 'ar' ? 'كاشف سيمون (Simon)' : 'Simon Reagent'}</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-purple-700 dark:text-purple-300">
                  {lang === 'ar' ? 'المواد المساعدة' : 'Supporting Materials'}
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>{lang === 'ar' ? 'الماء المقطر' : 'Distilled Water'}</span>
                  </li>
                  <li className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>{lang === 'ar' ? 'أطباق الاختبار' : 'Test Plates'}</span>
                  </li>
                  <li className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>{lang === 'ar' ? 'قطارات دقيقة' : 'Precision Droppers'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* تعليمات إجراء الاختبار - Test Procedure Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-blue-500 mb-8">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {lang === 'ar' ? 'تعليمات إجراء الاختبار' : 'Test Procedure Instructions'}
              </h2>
            </div>
            <div className="space-y-4">
              {safetyRules.map((rule, index) => (
                <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-muted-foreground">
                    {lang === 'ar' ? rule.ar : rule.en}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* تحذيرات السلامة الخاصة - Special Safety Warnings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-red-500 mb-8">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {lang === 'ar' ? 'تحذيرات السلامة الخاصة' : 'Special Safety Warnings'}
              </h2>
            </div>
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">
                  {lang === 'ar' ? 'تحذيرات حرجة' : 'Critical Warnings'}
                </h3>
                <ul className="space-y-2 text-red-700 dark:text-red-300">
                  <li>• {lang === 'ar' ? 'لا تخلط الكواشف المختلفة مع بعضها البعض' : 'Never mix different reagents together'}</li>
                  <li>• {lang === 'ar' ? 'لا تستنشق الأبخرة المتصاعدة من التفاعلات' : 'Do not inhale vapors from reactions'}</li>
                  <li>• {lang === 'ar' ? 'تجنب ملامسة الكواشف للجلد أو العينين' : 'Avoid reagent contact with skin or eyes'}</li>
                  <li>• {lang === 'ar' ? 'احتفظ بالكواشف في درجة حرارة الغرفة وبعيداً عن الضوء' : 'Store reagents at room temperature away from light'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Emergency Procedures */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-foreground">
                {lang === 'ar' ? 'إجراءات الطوارئ' : 'Emergency Procedures'}
              </h2>
            </div>
            <div className="space-y-4">
              {emergencySteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-600 text-sm font-bold">!</span>
                  </div>
                  <p className="text-muted-foreground">
                    {lang === 'ar' ? step.ar : step.en}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Requirements */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {lang === 'ar' ? 'المعدات المطلوبة' : 'Required Equipment'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {lang === 'ar' ? 'معدات الحماية الشخصية' : 'Personal Protective Equipment'}
                </h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {lang === 'ar' ? 'قفازات مقاومة للكيماويات' : 'Chemical-resistant gloves'}</li>
                  <li>• {lang === 'ar' ? 'نظارات واقية' : 'Safety goggles'}</li>
                  <li>• {lang === 'ar' ? 'معطف المختبر' : 'Lab coat'}</li>
                  <li>• {lang === 'ar' ? 'حذاء مغلق' : 'Closed-toe shoes'}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {lang === 'ar' ? 'معدات المختبر' : 'Laboratory Equipment'}
                </h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {lang === 'ar' ? 'خزانة الأبخرة' : 'Fume hood'}</li>
                  <li>• {lang === 'ar' ? 'غسالة عيون طوارئ' : 'Emergency eyewash station'}</li>
                  <li>• {lang === 'ar' ? 'دش أمان' : 'Safety shower'}</li>
                  <li>• {lang === 'ar' ? 'طفاية حريق' : 'Fire extinguisher'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
