import { Language } from '@/types';
import { GoogleSignInDebugger } from '@/components/auth/GoogleSignInDebugger';

interface DebugGooglePageProps {
  params: Promise<{ lang: Language }>;
}

export default async function DebugGooglePage({ params }: DebugGooglePageProps) {
  const { lang } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">
          {lang === 'ar' ? 'تشخيص Google Sign-In' : 'Google Sign-In Debug'}
        </h1>
        <GoogleSignInDebugger lang={lang} />
      </div>
    </div>
  );
}
