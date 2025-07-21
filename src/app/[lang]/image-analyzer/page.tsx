import { Metadata } from 'next';
import { Language } from '@/types';
import { ImageAnalyzerPage } from '@/components/pages/image-analyzer-page';
import { getTranslations } from '@/lib/translations';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface ImageAnalyzerPageProps {
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
    title: lang === 'ar' ? 'محلل الصور - اختبارات الألوان' : 'Image Analyzer - Color Testing',
    description: lang === 'ar' 
      ? 'تحليل الصور لتحديد الألوان والمواد الكيميائية'
      : 'Analyze images to identify colors and chemical substances',
  };
}

export default async function ImageAnalyzer({ params }: ImageAnalyzerPageProps) {
  const { lang } = await params;

  return (
    <AuthGuard lang={lang} requireAuth={true}>
      <ImageAnalyzerPage lang={lang} />
    </AuthGuard>
  );
}
