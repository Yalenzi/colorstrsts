'use client';

import React from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpenIcon,
  AcademicCapIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface ScientificReferencesProps {
  reference?: string;
  reference_ar?: string;
  lang: Language;
  testName?: string;
  testName_ar?: string;
}

export function ScientificReferences({ 
  reference, 
  reference_ar, 
  lang, 
  testName, 
  testName_ar 
}: ScientificReferencesProps) {
  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      title: 'المراجع العلمية',
      description: 'المصادر الأكاديمية لهذه الطريقة',
      noReferences: 'لا توجد مراجع علمية متاحة حالياً',
      academicSource: 'المصدر الأكاديمي لهذه الطريقة',
      researchPapers: 'الأوراق البحثية',
      methodology: 'منهجية الاختبار'
    },
    en: {
      title: 'Scientific References',
      description: 'Academic sources for this method',
      noReferences: 'No scientific references available currently',
      academicSource: 'Academic source for this method',
      researchPapers: 'Research Papers',
      methodology: 'Test Methodology'
    }
  };

  const t = texts[lang];

  // Get the appropriate reference based on language
  const currentReference = lang === 'ar' && reference_ar ? reference_ar : reference;

  // If no reference is available, show a placeholder
  if (!currentReference) {
    return (
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 rtl:space-x-reverse text-amber-800 dark:text-amber-200">
            <BookOpenIcon className="h-6 w-6" />
            <span>{t.title}</span>
          </CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            {t.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 rtl:space-x-reverse text-amber-600 dark:text-amber-400">
            <AcademicCapIcon className="h-5 w-5" />
            <span className="text-sm">{t.noReferences}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Parse references (split by bullet points or newlines)
  const references = currentReference
    .split(/\n|•/)
    .map(ref => ref.trim())
    .filter(ref => ref.length > 0);

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3 rtl:space-x-reverse text-blue-800 dark:text-blue-200">
          <BookOpenIcon className="h-6 w-6" />
          <span>{t.title}</span>
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          {t.academicSource}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Name Reference */}
        {(testName || testName_ar) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                {t.methodology}
              </h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {lang === 'ar' && testName_ar ? testName_ar : testName}
            </p>
          </div>
        )}

        {/* References List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
            <AcademicCapIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              {t.researchPapers}
            </h4>
          </div>
          
          <div className="space-y-3">
            {references.map((ref, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 rtl:space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-md border-l-4 rtl:border-l-0 rtl:border-r-4 border-blue-400 dark:border-blue-500"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {ref}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
            {lang === 'ar' 
              ? 'هذه المراجع مأخوذة من مصادر علمية موثقة ومعتمدة في المجال الأكاديمي'
              : 'These references are from documented scientific sources and are recognized in the academic field'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
