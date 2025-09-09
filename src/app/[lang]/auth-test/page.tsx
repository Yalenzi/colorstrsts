import { Metadata } from 'next';
import { Language } from '@/types';
import { GoogleAuthTest } from '@/components/auth/GoogleAuthTest';
import { ImprovedAuthProvider } from '@/components/auth/ImprovedAuthProvider';

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
    <ImprovedAuthProvider>
      <GoogleAuthTest lang={lang} />
    </ImprovedAuthProvider>
  );
}
