import { Metadata } from 'next';
import { Language } from '@/types';
import { AuthProvider } from '@/components/auth/AuthProvider';
import ProductionAuthFix from '@/components/auth/ProductionAuthFix';

interface AuthTestPageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({ params }: AuthTestPageProps): Promise<Metadata> {
  const { lang } = await params;
  
  return {
    title: lang === 'ar' ? 'اختبار المصادقة' : 'Authentication Test',
    description: lang === 'ar' ? 'صفحة اختبار المصادقة وإصلاح المشاكل' : 'Authentication testing and troubleshooting page',
    robots: 'noindex, nofollow',
  };
}

export default async function AuthTestPage({ params }: AuthTestPageProps) {
  const { lang } = await params;
  
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {lang === 'ar' ? 'اختبار وإصلاح المصادقة' : 'Authentication Test & Fix'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {lang === 'ar' 
                ? 'صفحة لاختبار وإصلاح مشاكل المصادقة في بيئة الإنتاج'
                : 'Page for testing and fixing authentication issues in production environment'
              }
            </p>
          </div>
          
          <ProductionAuthFix lang={lang} />
        </div>
      </div>
    </AuthProvider>
  );
}
