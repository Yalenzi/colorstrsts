'use client';

import { useEffect } from 'react';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

export function FirebaseAuthDomainFixer() {
  useEffect(() => {
    const auth = getAuth();
    
    // تحديث auth domain إذا كان مختلف
    if (typeof window !== 'undefined') {
      const currentDomain = window.location.hostname;
      
      console.log('🔧 Current domain:', currentDomain);
      console.log('🔧 Auth domain from config:', auth.config.authDomain);
      
      // إذا كنا على colorstest.com، تأكد من أن Firebase يعرف ذلك
      if (currentDomain === 'colorstest.com' || currentDomain === 'www.colorstest.com') {
        console.log('✅ Running on production domain');
        
        // تحديث auth domain في runtime إذا لزم الأمر
        if (auth.config.authDomain !== 'colorstest.com') {
          console.log('⚠️ Auth domain mismatch, updating...');
          
          // هذا hack لتحديث auth domain
          (auth as any).config.authDomain = 'colorstest.com';
          
          console.log('✅ Auth domain updated to:', (auth as any).config.authDomain);
        }
      }
    }
  }, []);

  return null;
}
