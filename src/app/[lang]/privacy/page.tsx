import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslationsSync } from '@/lib/translations';
import { Language } from '@/types';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  LockClosedIcon,
  UserGroupIcon,
  ServerIcon,
  CogIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  EyeIcon,
  KeyIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import {
  PolicyFrame,
  PolicyBulletPoint,
  PolicySection,
  PolicyHeader,
  ContactInfo,
  UpdateNotice,
  PolicyIcons
} from '@/components/ui/policy-components';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface PrivacyPageProps {
  params: {
    lang: Language;
  };
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { lang } = params;
  
  if (!['ar', 'en'].includes(lang)) {
    notFound();
  }

  const t = getTranslationsSync(lang);

  return {
    title: lang === 'ar' ? 'سياسة الخصوصية - ColorTests' : 'Privacy Policy - ColorTests',
    description: lang === 'ar' 
      ? 'سياسة الخصوصية لتطبيق ColorTests - نظام الكشف المختبري المتقدم. تعرف على كيفية حماية بياناتك الشخصية.'
      : 'Privacy Policy for ColorTests - Advanced Laboratory Detection System. Learn how we protect your personal data.',
  };
}

export default function PrivacyPage({ params }: PrivacyPageProps) {
  const { lang } = params;
  
  if (!['ar', 'en'].includes(lang)) {
    notFound();
  }

  const t = getTranslationsSync(lang);

  const lastUpdated = '2024-01-15';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Enhanced Header */}
        <PolicyHeader
          title={lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          subtitle={lang === 'ar'
            ? 'ColorTests - نظام الكشف المختبري المتقدم'
            : 'ColorTests - Advanced Laboratory Detection System'
          }
          lastUpdated={lang === 'ar' ? `آخر تحديث: ${lastUpdated}` : `Last Updated: ${lastUpdated}`}
        />

        {/* Enhanced Introduction */}
        <PolicyFrame
          title={lang === 'ar' ? 'مقدمة' : 'Introduction'}
          icon={<ExclamationTriangleIcon className="w-7 h-7" />}
          variant="info"
        >
          <div className="space-y-4">
            <p className="text-foreground leading-relaxed text-lg">
              {lang === 'ar'
                ? 'نحن في ColorTests نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية. تشرح هذه السياسة كيفية جمعنا واستخدامنا وحماية المعلومات التي تقدمها لنا عند استخدام تطبيق ColorTests للكشف المختبري المتقدم.'
                : 'At ColorTests, we are committed to protecting your privacy and the security of your personal data. This policy explains how we collect, use, and protect the information you provide when using the ColorTests advanced laboratory detection application.'
              }
            </p>
            <p className="text-foreground leading-relaxed text-lg">
              {lang === 'ar'
                ? 'تطبيق ColorTests هو نظام علمي متخصص في كشف المواد الكيميائية، ونحن ندرك حساسية البيانات التي نتعامل معها ونلتزم بأعلى معايير الحماية والخصوصية.'
                : 'ColorTests is a scientific system specialized in chemical substance detection, and we understand the sensitivity of the data we handle and are committed to the highest standards of protection and privacy.'
              }
            </p>
          </div>
        </PolicyFrame>

        {/* Enhanced Data Collection */}
        <PolicyFrame
          title={lang === 'ar' ? 'جمع البيانات الشخصية' : 'Personal Data Collection'}
          icon={<ServerIcon className="w-7 h-7" />}
          variant="primary"
        >
          <PolicySection title={lang === 'ar' ? 'البيانات التي نجمعها:' : 'Data We Collect:'}>
            <div className="space-y-3">
              <PolicyBulletPoint
                icon={<UserGroupIcon className="w-5 h-5" />}
                text={lang === 'ar'
                  ? 'معلومات الحساب: الاسم، البريد الإلكتروني، كلمة المرور المشفرة'
                  : 'Account Information: Name, email address, encrypted password'
                }
              />
              <PolicyBulletPoint
                icon={<DocumentTextIcon className="w-5 h-5" />}
                text={lang === 'ar'
                  ? 'نتائج الاختبارات: البيانات المختبرية، الصور، النتائج التحليلية'
                  : 'Test Results: Laboratory data, images, analytical results'
                }
              />
              <PolicyBulletPoint
                icon={<ClockIcon className="w-5 h-5" />}
                text={lang === 'ar'
                  ? 'معلومات الاستخدام: تاريخ الاختبارات، تفضيلات المستخدم، إعدادات التطبيق'
                  : 'Usage Information: Test history, user preferences, application settings'
                }
              />
              <PolicyBulletPoint
                icon={<CogIcon className="w-5 h-5" />}
                text={lang === 'ar'
                  ? 'معلومات الجهاز: نوع الجهاز، نظام التشغيل، معرف التطبيق'
                  : 'Device Information: Device type, operating system, application identifier'
                }
              />
              <PolicyBulletPoint
                icon={<KeyIcon className="w-5 h-5" />}
                text={lang === 'ar'
                  ? 'معلومات الدفع: تفاصيل الاشتراك، تاريخ المعاملات (بدون تفاصيل بطاقة الائتمان)'
                  : 'Payment Information: Subscription details, transaction history (without credit card details)'
                }
              />
            </div>
          </PolicySection>
          </div>
        </div>

        {/* Data Usage */}
        <div className="lab-card mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <CogIcon className="w-6 h-6 text-primary-600 mr-3 rtl:ml-3 rtl:mr-0" />
            {lang === 'ar' ? 'استخدام البيانات' : 'Data Usage'}
          </h2>
          
          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              {lang === 'ar'
                ? 'نستخدم البيانات المجمعة للأغراض التالية:'
                : 'We use the collected data for the following purposes:'
              }
            </p>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'تقديم خدمات الكشف المختبري وتحليل النتائج'
                  : 'Providing laboratory detection services and result analysis'
                }
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'تحسين دقة الاختبارات وتطوير خوارزميات التحليل'
                  : 'Improving test accuracy and developing analysis algorithms'
                }
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'إدارة حسابات المستخدمين والاشتراكات'
                  : 'Managing user accounts and subscriptions'
                }
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'تقديم الدعم التقني وخدمة العملاء'
                  : 'Providing technical support and customer service'
                }
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'الامتثال للمتطلبات القانونية والتنظيمية'
                  : 'Compliance with legal and regulatory requirements'
                }
              </li>
            </ul>
          </div>
        </div>

        {/* Data Sharing */}
        <div className="lab-card mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <UserGroupIcon className="w-6 h-6 text-primary-600 mr-3 rtl:ml-3 rtl:mr-0" />
            {lang === 'ar' ? 'مشاركة البيانات' : 'Data Sharing'}
          </h2>

          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              {lang === 'ar'
                ? 'نحن لا نبيع أو نؤجر بياناتك الشخصية لأطراف ثالثة. قد نشارك البيانات في الحالات التالية فقط:'
                : 'We do not sell or rent your personal data to third parties. We may share data only in the following cases:'
              }
            </p>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'مقدمي الخدمات الموثوقين: Firebase (Google) للمصادقة والتخزين السحابي'
                  : 'Trusted Service Providers: Firebase (Google) for authentication and cloud storage'
                }
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'المتطلبات القانونية: عند الطلب من السلطات المختصة وفقاً للقانون'
                  : 'Legal Requirements: When requested by competent authorities in accordance with law'
                }
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'حماية الحقوق: لحماية حقوقنا أو حقوق المستخدمين الآخرين'
                  : 'Rights Protection: To protect our rights or the rights of other users'
                }
              </li>
            </ul>
          </div>
        </div>

        {/* Data Security */}
        <div className="lab-card mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <LockClosedIcon className="w-6 h-6 text-primary-600 mr-3 rtl:ml-3 rtl:mr-0" />
            {lang === 'ar' ? 'أمان البيانات' : 'Data Security'}
          </h2>

          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              {lang === 'ar'
                ? 'نطبق تدابير أمنية متقدمة لحماية بياناتك:'
                : 'We implement advanced security measures to protect your data:'
              }
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  {lang === 'ar' ? 'التشفير' : 'Encryption'}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {lang === 'ar'
                    ? 'تشفير البيانات أثناء النقل والتخزين باستخدام معايير AES-256'
                    : 'Data encryption in transit and at rest using AES-256 standards'
                  }
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  {lang === 'ar' ? 'المصادقة الآمنة' : 'Secure Authentication'}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {lang === 'ar'
                    ? 'نظام مصادقة متعدد العوامل وحماية ضد الهجمات الإلكترونية'
                    : 'Multi-factor authentication system and protection against cyber attacks'
                  }
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  {lang === 'ar' ? 'النسخ الاحتياطي' : 'Backup Systems'}
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {lang === 'ar'
                    ? 'نسخ احتياطية منتظمة ومؤمنة في مراكز بيانات متعددة'
                    : 'Regular and secure backups in multiple data centers'
                  }
                </p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  {lang === 'ar' ? 'المراقبة المستمرة' : 'Continuous Monitoring'}
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {lang === 'ar'
                    ? 'مراقبة أمنية على مدار الساعة وكشف التهديدات المبكر'
                    : '24/7 security monitoring and early threat detection'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Rights */}
        <div className="lab-card mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <ShieldCheckIcon className="w-6 h-6 text-primary-600 mr-3 rtl:ml-3 rtl:mr-0" />
            {lang === 'ar' ? 'حقوق المستخدمين' : 'User Rights'}
          </h2>

          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              {lang === 'ar'
                ? 'وفقاً للقوانين الدولية (GDPR، CCPA)، لديك الحقوق التالية:'
                : 'In accordance with international laws (GDPR, CCPA), you have the following rights:'
              }
            </p>
            <div className="grid gap-4">
              <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 rtl:ml-4 rtl:mr-0 flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {lang === 'ar' ? 'حق الوصول' : 'Right to Access'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'ar'
                      ? 'طلب نسخة من بياناتك الشخصية المخزنة لدينا'
                      : 'Request a copy of your personal data stored with us'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 rtl:ml-4 rtl:mr-0 flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {lang === 'ar' ? 'حق التصحيح' : 'Right to Rectification'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'ar'
                      ? 'طلب تصحيح أو تحديث البيانات غير الصحيحة'
                      : 'Request correction or update of incorrect data'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 rtl:ml-4 rtl:mr-0 flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {lang === 'ar' ? 'حق الحذف' : 'Right to Erasure'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'ar'
                      ? 'طلب حذف بياناتك الشخصية في ظروف معينة'
                      : 'Request deletion of your personal data under certain circumstances'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 rtl:ml-4 rtl:mr-0 flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {lang === 'ar' ? 'حق النقل' : 'Right to Portability'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'ar'
                      ? 'الحصول على بياناتك بتنسيق قابل للقراءة آلياً'
                      : 'Obtain your data in a machine-readable format'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cookies */}
        <div className="lab-card mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <CogIcon className="w-6 h-6 text-primary-600 mr-3 rtl:ml-3 rtl:mr-0" />
            {lang === 'ar' ? 'ملفات تعريف الارتباط' : 'Cookies'}
          </h2>

          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              {lang === 'ar'
                ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربة المستخدم:'
                : 'We use cookies to improve user experience:'
              }
            </p>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-950">
                <h4 className="font-semibold text-foreground mb-1">
                  {lang === 'ar' ? 'ملفات تعريف الارتباط الأساسية' : 'Essential Cookies'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar'
                    ? 'ضرورية لتشغيل التطبيق وتسجيل الدخول والأمان'
                    : 'Necessary for application operation, login, and security'
                  }
                </p>
              </div>
              <div className="p-3 border-l-4 border-secondary-500 bg-secondary-50 dark:bg-secondary-950">
                <h4 className="font-semibold text-foreground mb-1">
                  {lang === 'ar' ? 'ملفات تعريف الارتباط التحليلية' : 'Analytics Cookies'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar'
                    ? 'لفهم كيفية استخدام التطبيق وتحسين الأداء'
                    : 'To understand how the application is used and improve performance'
                  }
                </p>
              </div>
              <div className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-950">
                <h4 className="font-semibold text-foreground mb-1">
                  {lang === 'ar' ? 'ملفات تعريف الارتباط الوظيفية' : 'Functional Cookies'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar'
                    ? 'لحفظ تفضيلاتك وإعداداتك الشخصية'
                    : 'To save your preferences and personal settings'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="lab-card mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <ServerIcon className="w-6 h-6 text-primary-600 mr-3 rtl:ml-3 rtl:mr-0" />
            {lang === 'ar' ? 'الاحتفاظ بالبيانات' : 'Data Retention'}
          </h2>

          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              {lang === 'ar'
                ? 'نحتفظ ببياناتك للفترات التالية:'
                : 'We retain your data for the following periods:'
              }
            </p>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'بيانات الحساب: طوال فترة نشاط الحساب + 3 سنوات بعد الإغلاق'
                  : 'Account Data: During account activity + 3 years after closure'
                }
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'نتائج الاختبارات: 7 سنوات للامتثال للمتطلبات المختبرية'
                  : 'Test Results: 7 years for compliance with laboratory requirements'
                }
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'بيانات الاستخدام: 2 سنة لأغراض التحليل والتحسين'
                  : 'Usage Data: 2 years for analysis and improvement purposes'
                }
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'سجلات الأمان: 1 سنة للمراجعة الأمنية'
                  : 'Security Logs: 1 year for security review'
                }
              </li>
            </ul>
          </div>
        </div>

        {/* Enhanced Contact Information */}
        <PolicyFrame
          title={lang === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
          icon={<EnvelopeIcon className="w-7 h-7" />}
          variant="secondary"
        >
          <div className="space-y-6">
            <p className="text-foreground leading-relaxed text-lg">
              {lang === 'ar'
                ? 'لأي استفسارات حول سياسة الخصوصية أو لممارسة حقوقك، يرجى التواصل معنا:'
                : 'For any inquiries about this privacy policy or to exercise your rights, please contact us:'
              }
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <ContactInfo
                title={lang === 'ar' ? 'مسؤول حماية البيانات' : 'Data Protection Officer'}
                email="aburakan4551@gmail.com"
                variant="primary"
              />
              <ContactInfo
                title={lang === 'ar' ? 'الدعم التقني' : 'Technical Support'}
                email="aburakan4551@gmail.com"
                variant="secondary"
              />
            </div>
            <UpdateNotice>
              <p className="text-sm font-medium">
                {lang === 'ar'
                  ? 'نلتزم بالرد على استفساراتك خلال 72 ساعة من تاريخ الاستلام'
                  : 'We commit to responding to your inquiries within 72 hours of receipt'
                }
              </p>
            </UpdateNotice>
          </div>
        </PolicyFrame>

        {/* Updates */}
        <div className="lab-card">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <DocumentTextIcon className="w-6 h-6 text-primary-600 mr-3 rtl:ml-3 rtl:mr-0" />
            {lang === 'ar' ? 'تحديثات السياسة' : 'Policy Updates'}
          </h2>

          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              {lang === 'ar'
                ? 'قد نقوم بتحديث هذه السياسة من وقت لآخر. سنقوم بإشعارك بأي تغييرات جوهرية عبر:'
                : 'We may update this policy from time to time. We will notify you of any material changes through:'
              }
            </p>
            <ul className="space-y-2 text-foreground">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'إشعار عبر البريد الإلكتروني المسجل'
                  : 'Notification via registered email'
                }
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'إشعار داخل التطبيق عند تسجيل الدخول'
                  : 'In-app notification upon login'
                }
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></span>
                {lang === 'ar'
                  ? 'تحديث تاريخ آخر تعديل في أعلى هذه الصفحة'
                  : 'Update of last modified date at the top of this page'
                }
              </li>
            </ul>
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                {lang === 'ar'
                  ? 'استمرار استخدامك للتطبيق بعد تحديث السياسة يعني موافقتك على التغييرات الجديدة.'
                  : 'Continued use of the application after policy updates means your acceptance of the new changes.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
