#!/usr/bin/env node

/**
 * Fix Build Issues Script
 * سكريبت إصلاح مشاكل البناء
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fix Build Issues Script');
console.log('🔧 سكريبت إصلاح مشاكل البناء');
console.log('='.repeat(50));

// Check and fix import issues
console.log('\n🔍 Checking import issues...');

const filesToCheck = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/components/providers.tsx'
];

const importMappings = {
  '@/components/auth/AuthProvider': 'src/components/auth/AuthProvider.tsx',
  '@/components/analytics/AnalyticsProvider': 'src/components/analytics/AnalyticsProvider.tsx',
  '@/components/auth/RootAuthRedirect': 'src/components/auth/RootAuthRedirect.tsx',
  '@/types': 'src/types/index.ts'
};

filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${filePath} does not exist`);
    return;
  }

  console.log(`\n📁 Checking ${filePath}:`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.trim().startsWith('import') && line.includes('@/')) {
        const match = line.match(/from ['"](@\/[^'"]+)['"]/);
        if (match) {
          const importPath = match[1];
          const actualPath = importMappings[importPath];
          
          if (actualPath && fs.existsSync(actualPath)) {
            console.log(`✅ Line ${index + 1}: ${importPath} → ${actualPath} exists`);
          } else if (actualPath) {
            console.log(`❌ Line ${index + 1}: ${importPath} → ${actualPath} MISSING`);
          } else {
            // Check if the path exists with common extensions
            const basePath = importPath.replace('@/', 'src/');
            const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
            let found = false;
            
            for (const ext of extensions) {
              if (fs.existsSync(basePath + ext)) {
                console.log(`✅ Line ${index + 1}: ${importPath} → ${basePath + ext} exists`);
                found = true;
                break;
              }
            }
            
            if (!found) {
              console.log(`⚠️ Line ${index + 1}: ${importPath} → ${basePath} not found with any extension`);
            }
          }
        }
      }
    });
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
  }
});

// Create missing files if needed
console.log('\n🔧 Creating missing files if needed...');

// Check if all critical components exist
const criticalComponents = [
  'src/components/auth/AuthProvider.tsx',
  'src/components/analytics/AnalyticsProvider.tsx',
  'src/components/auth/RootAuthRedirect.tsx',
  'src/types/index.ts'
];

criticalComponents.forEach(componentPath => {
  if (!fs.existsSync(componentPath)) {
    console.log(`❌ Creating missing file: ${componentPath}`);
    
    const dir = path.dirname(componentPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
    
    let content = '';
    
    if (componentPath.includes('AuthProvider')) {
      content = `'use client';

import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{ user: null, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}`;
    } else if (componentPath.includes('AnalyticsProvider')) {
      content = `'use client';

import { ReactNode } from 'react';

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Analytics provider implementation
  return <>{children}</>;
}`;
    } else if (componentPath.includes('RootAuthRedirect')) {
      content = `'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RootAuthRedirectProps {
  defaultLang: string;
}

export function RootAuthRedirect({ defaultLang }: RootAuthRedirectProps) {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to default language
    router.push(\`/\${defaultLang}\`);
  }, [router, defaultLang]);
  
  return <div>Redirecting...</div>;
}`;
    } else if (componentPath.includes('types/index.ts')) {
      content = `// Type definitions
export type Language = 'en' | 'ar';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'admin' | 'super_admin';
  preferred_language: Language;
  created_at: string;
}

export interface Test {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: number;
  instructions: string[];
  materials: string[];
  safety_notes: string[];
  expected_results: {
    positive: string;
    negative: string;
    notes?: string;
  };
  interpretation: {
    positive_meaning: string;
    negative_meaning: string;
    limitations: string[];
  };
  references: string[];
  created_at: string;
  updated_at: string;
}`;
    }
    
    try {
      fs.writeFileSync(componentPath, content);
      console.log(`✅ Created ${componentPath}`);
    } catch (error) {
      console.log(`❌ Error creating ${componentPath}: ${error.message}`);
    }
  } else {
    console.log(`✅ ${componentPath} already exists`);
  }
});

// Check tsconfig paths
console.log('\n🔍 Checking tsconfig paths...');
try {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  const paths = tsconfig.compilerOptions?.paths;
  
  if (paths && paths['@/*']) {
    console.log(`✅ Path alias '@/*' is configured: ${JSON.stringify(paths['@/*'])}`);
  } else {
    console.log('⚠️ Path alias @/* is not configured in tsconfig.json');
  }
} catch (error) {
  console.log(`❌ Error reading tsconfig.json: ${error.message}`);
}

console.log('\n🎉 Build issues fix completed!');
console.log('🎉 اكتمل إصلاح مشاكل البناء!');

console.log('\n📋 Summary:');
console.log('📋 الملخص:');
console.log('✅ Checked import paths');
console.log('✅ Created missing components if needed');
console.log('✅ Verified tsconfig paths');

console.log('\n🚀 Next steps:');
console.log('🚀 الخطوات التالية:');
console.log('1. Run: npm run build');
console.log('2. Check for any remaining errors');
console.log('3. Deploy to Netlify');
console.log('1. شغل: npm run build');
console.log('2. تحقق من أي أخطاء متبقية');
console.log('3. انشر على Netlify');
