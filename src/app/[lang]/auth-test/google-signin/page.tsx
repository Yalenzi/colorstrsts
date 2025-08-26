import { Language } from '@/types';
import { GoogleSignInTest } from '@/components/auth/GoogleSignInTest';

interface PageProps {
  params: {
    lang: Language;
  };
}

export default function GoogleSignInTestPage({ params: { lang } }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {lang === 'ar' ? 'اختبار تسجيل الدخول بـ Google' : 'Google Sign-In Test'}
          </h1>
          <p className="text-gray-600">
            {lang === 'ar' 
              ? 'صفحة اختبار لتشخيص مشاكل تسجيل الدخول بـ Google مع Firebase'
              : 'Test page to diagnose Google Sign-In issues with Firebase'
            }
          </p>
        </div>
        
        <GoogleSignInTest />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' }
  ];
}
