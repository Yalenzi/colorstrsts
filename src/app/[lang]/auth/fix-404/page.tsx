import { Metadata } from 'next';
import { Language } from '@/types';
import { GoogleAuth404Fix } from '@/components/auth/GoogleAuth404Fix';

interface Fix404PageProps {
  params: {
    lang: Language;
  };
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Language };
}): Promise<Metadata> {
  const { lang } = params;

  return {
    title: lang === 'ar' ? 'إصلاح مشكلة 404 في Google Auth' : 'Fix Google Auth 404 Error',
    description: lang === 'ar' 
      ? 'حل مشاكل تسجيل الدخول وإنشاء الحساب بـ Google'
      : 'Resolve Google Sign-In and Sign-Up issues',
  };
}

export default async function Fix404Page({ params }: Fix404PageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-background dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        <GoogleAuth404Fix lang={lang} />
      </div>
    </div>
  );
}
