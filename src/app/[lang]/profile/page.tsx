import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Language } from '@/types';
import { getAllTranslations } from '@/lib/translations';
import UserProfile from '@/components/profile/UserProfile';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface PageProps {
  params: {
    lang: Language;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = params;

  return {
    title: lang === 'ar' ? 'الملف الشخصي' : 'Profile',
    description: lang === 'ar' ? 'إدارة معلوماتك الشخصية وإعداداتك' : 'Manage your personal information and settings',
  };
}

export default function ProfilePage({ params }: PageProps) {
  const { lang } = params;

  // Validate language
  if (!['ar', 'en'].includes(lang)) {
    notFound();
  }

  const translations = getAllTranslations(lang);
  const isRTL = lang === 'ar';

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8">
        <UserProfile
          translations={translations.profile || {}}
          isRTL={isRTL}
          lang={lang}
        />
      </div>
    </div>
  );
}
