import { Metadata } from 'next';
import { Language } from '@/types';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

interface AdminLoginPageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({ params }: AdminLoginPageProps): Promise<Metadata> {
  const { lang } = await params;
  
  return {
    title: lang === 'ar' ? 'دخول لوحة التحكم الإدارية' : 'Admin Login',
    description: lang === 'ar' ? 'دخول آمن للوحة التحكم الإدارية' : 'Secure admin panel login',
    robots: 'noindex, nofollow',
  };
}

export default async function AdminLoginPage({ params }: AdminLoginPageProps) {
  const { lang } = await params;
  
  return <AdminLoginForm lang={lang} />;
}
