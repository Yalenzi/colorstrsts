// app/[lang]/admin/login/page.tsx

import { Metadata } from 'next';
import { Language } from '@/types';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard'; // اختياري إذا كنت تستخدم حماية

interface AdminLoginPageProps {
  params: {
    lang: Language;
  };
}

export function generateMetadata({ params }: AdminLoginPageProps): Metadata {
  const { lang } = params;

  return {
    title: lang === 'ar' ? 'دخول لوحة التحكم الإدارية' : 'Admin Login',
    description: lang === 'ar' ? 'دخول آمن للوحة التحكم الإدارية' : 'Secure admin panel login',
    robots: 'noindex, nofollow',
  };
}

export default function AdminLoginPage({ params }: AdminLoginPageProps) {
  const { lang } = params;

  return (
    <AdminAuthGuard lang={lang}>
      <AdminLoginForm lang={lang} />
    </AdminAuthGuard>
  );
}
