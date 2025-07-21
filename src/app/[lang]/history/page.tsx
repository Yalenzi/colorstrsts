import { Metadata } from 'next';
import { Language } from '@/types';
import { HistoryPage } from '@/components/pages/history-page';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface HistoryPageProps {
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
    title: lang === 'ar' ? 'آخر الاختبارات السابقة - اختبارات الألوان' : 'Recent Tests History - Color Testing',
    description: lang === 'ar' 
      ? 'تصفح الاختبارات التي قمت بزيارتها مؤخراً'
      : 'Browse the tests you have recently visited',
  };
}

export default async function History({ params }: HistoryPageProps) {
  const { lang } = await params;

  return <HistoryPage lang={lang} />;
}
