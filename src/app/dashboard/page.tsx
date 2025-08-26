'use client';

import React from 'react';
import { Providers } from '@/components/providers';
import { UserDashboard } from '@/components/dashboard/UserDashboard';

export default function DashboardPage() {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <UserDashboard />
      </div>
    </Providers>
  );
}
