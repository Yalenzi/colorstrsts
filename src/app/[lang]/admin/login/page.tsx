import { Metadata } from 'next';
import { Language } from '@/types';
import SecureAdminLogin from '@/components/admin/SecureAdminLogin';

interface AdminLoginPageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({ params }: AdminLoginPageProps): Promise<Metadata> {
  const { lang } = await params;
  
  return {
    title: lang === 'ar' ? 'دخول لوحة التحكم الإدارية' : 'Admin Panel Login',
    description: lang === 'ar' ? 'دخول آمن للوحة التحكم الإدارية' : 'Secure admin panel login',
    robots: 'noindex, nofollow',
  };
}

export default async function AdminLoginPage({ params }: AdminLoginPageProps) {
  const { lang } = await params;
  
  return <SecureAdminLogin lang={lang} />;
}
