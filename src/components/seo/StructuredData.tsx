import { Language } from '@/types';

interface StructuredDataProps {
  lang: Language;
  pageType?: 'website' | 'article' | 'service';
  title?: string;
  description?: string;
  url?: string;
}

export function StructuredData({ 
  lang, 
  pageType = 'website',
  title,
  description,
  url 
}: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://colorstest.com';
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": lang === 'ar' ? 'نظام اختبارات الألوان' : 'Color Testing System',
    "description": lang === 'ar' 
      ? 'نظام متقدم لاختبارات الألوان للكشف عن المخدرات والمؤثرات العقلية'
      : 'Advanced color testing system for drug and psychoactive substance detection',
    "url": baseUrl,
    "inLanguage": lang === 'ar' ? 'ar-SA' : 'en-US',
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/${lang}/tests?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": lang === 'ar' ? 'نظام اختبارات الألوان' : 'Color Testing System',
    "description": lang === 'ar' 
      ? 'نظام متقدم لاختبارات الألوان للكشف عن المخدرات والمؤثرات العقلية'
      : 'Advanced color testing system for drug and psychoactive substance detection',
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Arabic", "English"]
    }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": lang === 'ar' ? 'خدمات اختبار الألوان' : 'Color Testing Services',
    "description": lang === 'ar' 
      ? 'خدمات اختبار الألوان للكشف عن المخدرات والمؤثرات العقلية باستخدام الكواشف الكيميائية'
      : 'Color testing services for drug and psychoactive substance detection using chemical reagents',
    "provider": {
      "@type": "Organization",
      "name": lang === 'ar' ? 'نظام اختبارات الألوان' : 'Color Testing System'
    },
    "serviceType": lang === 'ar' ? 'اختبارات كيميائية' : 'Chemical Testing',
    "areaServed": {
      "@type": "Country",
      "name": lang === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia'
    }
  };

  const schemas = [websiteSchema, organizationSchema];
  
  if (pageType === 'service') {
    schemas.push(serviceSchema);
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas)
      }}
    />
  );
}
