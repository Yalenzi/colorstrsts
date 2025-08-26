'use client';

import { useEffect } from 'react';

export function CSPOverride() {
  useEffect(() => {
    // إضافة meta tag لـ CSP إذا لم يكن موجود
    if (typeof document !== 'undefined') {
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      
      if (!existingCSP) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = `
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'
            https://www.gstatic.com
            https://www.googleapis.com
            https://apis.google.com
            https://accounts.google.com
            https://*.firebaseio.com
            https://*.firebaseapp.com
            https://firebase.googleapis.com
            https://firebaseinstallations.googleapis.com;
          style-src 'self' 'unsafe-inline'
            https://fonts.googleapis.com
            https://fonts.gstatic.com;
          img-src 'self' data: https: blob:
            https://*.firebaseapp.com
            https://*.googleapis.com;
          font-src 'self' data:
            https://fonts.gstatic.com
            https://fonts.googleapis.com;
          connect-src 'self'
            https://*.firebaseio.com
            https://*.googleapis.com
            https://*.firebaseapp.com
            https://firebaseinstallations.googleapis.com
            https://firebase.googleapis.com
            https://identitytoolkit.googleapis.com
            https://securetoken.googleapis.com;
          frame-src 'self'
            https://accounts.google.com
            https://*.firebaseapp.com;
          worker-src 'self' blob:;
          child-src 'self' blob:;
          object-src 'none';
          base-uri 'self';
          form-action 'self' https://accounts.google.com;
          frame-ancestors 'none';
        `.replace(/\s+/g, ' ').trim();
        
        document.head.appendChild(meta);
        console.log('✅ CSP override applied for Google APIs');
      }
    }
  }, []);

  return null;
}
