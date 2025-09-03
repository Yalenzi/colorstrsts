'use client';

import React from 'react';
import { Providers } from '@/components/safe-providers';
import { SimpleDashboard } from '@/components/dashboard/SimpleDashboard';

export default function DashboardPage() {
  return (
    <Providers>
      <SimpleDashboard lang="ar" />
    </Providers>
  );
}
