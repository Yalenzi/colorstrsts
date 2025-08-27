import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://colorstest.com';
  
  // الصفحات الأساسية - English as default
  const staticPages = [
    '', // Root redirects to /en
    '/en', // Default language first
    '/ar',
    '/ar/tests',
    '/en/tests',
    '/ar/results',
    '/en/results',
    '/ar/help',
    '/en/help',
    '/ar/about',
    '/en/about',
    '/ar/contact',
    '/en/contact',
    '/ar/privacy',
    '/en/privacy',
    '/ar/terms',
    '/en/terms',
    '/ar/auth/login',
    '/en/auth/login',
    '/ar/auth/register',
    '/en/auth/register',
    '/ar/image-analysis',
    '/en/image-analysis',
    '/ar/history',
    '/en/history',
    '/ar/dashboard',
    '/en/dashboard',
  ];

  // إنشاء sitemap للصفحات الثابتة
  const staticSitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: page === '' || page === '/ar' || page === '/en' ? 1 : 0.8,
  }));

  // إضافة صفحات الاختبارات (إذا كانت موجودة)
  const testPages = [];
  for (let i = 1; i <= 35; i++) {
    testPages.push({
      url: `${baseUrl}/ar/tests/${i}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    });
    testPages.push({
      url: `${baseUrl}/en/tests/${i}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    });
  }

  return [...staticSitemap, ...testPages];
}
