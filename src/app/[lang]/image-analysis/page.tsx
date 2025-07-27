import { Metadata } from 'next';
import { Language } from '@/types';
import { ResponsiveImageAnalyzer } from '@/components/ui/responsive-image-analyzer';

interface PageProps {
  params: {
    lang: Language;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = params;
  
  return {
    title: lang === 'ar' ? 'محلل الألوان المتقدم - تحليل ذكي للألوان' : 'Advanced Color Analyzer - AI Color Analysis',
    description: lang === 'ar' 
      ? 'محلل الألوان المتقدم بالذكاء الاصطناعي. استخرج الألوان من الصور بدقة عالية مع معلومات مفصلة وتحليل كيميائي.'
      : 'Advanced AI-powered color analyzer. Extract colors from images with high precision, detailed information and chemical analysis.',
    keywords: lang === 'ar'
      ? 'تحليل الألوان, استخراج الألوان, ذكاء اصطناعي, تحليل الصور, منتقي الألوان'
      : 'color analysis, color extraction, AI, image analysis, color picker',
    openGraph: {
      title: lang === 'ar' ? 'محلل الألوان المتقدم' : 'Advanced Color Analyzer',
      description: lang === 'ar' 
        ? 'تحليل ذكي للألوان من الصور باستخدام الذكاء الاصطناعي'
        : 'AI-powered intelligent color analysis from images',
      type: 'website',
      locale: lang === 'ar' ? 'ar_SA' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: lang === 'ar' ? 'محلل الألوان المتقدم' : 'Advanced Color Analyzer',
      description: lang === 'ar' 
        ? 'تحليل ذكي للألوان من الصور'
        : 'AI-powered color analysis from images',
    },
  };
}

export default function ImageAnalysisPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <ResponsiveImageAnalyzer lang={params.lang} />
    </div>
  );
}
