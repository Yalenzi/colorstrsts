'use client';

import { useEffect } from 'react';
import { saveMockDataToLocalStorage } from '@/lib/mock-data-generator';

export function InitializeMockData() {
  useEffect(() => {
    // إنشاء البيانات التجريبية عند تحميل المكون
    saveMockDataToLocalStorage();
  }, []);

  return null; // مكون غير مرئي
}