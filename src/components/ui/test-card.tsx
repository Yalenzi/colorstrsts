'use client';

import { Language } from '@/types';
import { ChemicalTest } from '@/lib/local-data-service';
import { getTranslationsSync } from '@/lib/translations';
import {
  BeakerIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

interface TestCardProps {
  test: ChemicalTest;
  lang: Language;
  onClick: (testId: string) => void;
  disabled?: boolean;
}

export function TestCard({ test, lang, onClick, disabled = false }: TestCardProps) {
  const t = getTranslationsSync(lang);

  const getSafetyLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return ShieldCheckIcon;
      case 'medium': return ShieldCheckIcon;
      case 'high': return ShieldExclamationIcon;
      case 'extreme': return ExclamationTriangleIcon;
      case 'undefined':
      case 'unknown':
      case null:
      case undefined:
        return QuestionMarkCircleIcon;
      default: return ShieldCheckIcon;
    }
  };

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
      case 'extreme': return 'text-red-600 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'undefined':
      case 'unknown':
      case null:
      case undefined:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
      case 'advanced': return 'text-purple-600 bg-purple-50 dark:bg-purple-950';
      case 'specialized': return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950';
      case 'undefined':
      case 'unknown':
      case null:
      case undefined:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  const testName = lang === 'ar' ? test.method_name_ar : test.method_name;
  const testDescription = lang === 'ar' ? test.description_ar : test.description;

  // Handle undefined/null values with fallbacks
  const categoryKey = test.category || 'undefined';
  const safetyLevelKey = test.safety_level || 'undefined';

  const categoryLabel = t(`tests.categories.${categoryKey}`);
  const safetyLabel = t(`tests.safety_levels.${safetyLevelKey}`);

  const SafetyIcon = getSafetyLevelIcon(safetyLevelKey);

  return (
    <div
      className={`group relative lab-equipment overflow-hidden ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:scale-105 transition-all duration-300'
      }`}
      onClick={() => !disabled && onClick(test.id)}
    >
      {/* Scientific Header with gradient accent */}
      <div
        className="h-3 w-full bg-gradient-to-r"
        style={{
          background: `linear-gradient(90deg, ${test.color_primary}, ${test.color_primary}80)`
        }}
      />

      <div className="p-6">
        {/* Scientific Test Icon and Category */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300"
              style={{
                background: `linear-gradient(135deg, ${test.color_primary}20, ${test.color_primary}40)`,
                border: `2px solid ${test.color_primary}30`
              }}
            >
              <BeakerIcon
                className="h-8 w-8 animate-pulse-scientific"
                style={{ color: test.color_primary }}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>
            <div className="space-y-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(categoryKey)} shadow-sm`}>
                {categoryLabel}
              </span>
              <div className="precision-indicator confidence-good">
                <span className="text-xs">{lang === 'ar' ? 'معتمد' : 'Certified'}</span>
              </div>
            </div>
          </div>

          {/* Safety Level Indicator */}
          <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getSafetyLevelColor(safetyLevelKey)}`}>
            <SafetyIcon className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
            {safetyLabel}
          </div>
        </div>

        {/* Scientific Test Name */}
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary-600 transition-colors leading-tight">
          {testName}
        </h3>

        {/* Scientific Test Description */}
        <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
          {testDescription}
        </p>

        {/* Scientific Metrics */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <ClockIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-primary-600" />
              <span className="font-medium">
                {test.preparation_time} {t('tests.minutes')}
              </span>
            </div>
            <div className="precision-indicator precision-high">
              <span className="text-xs font-mono">{test.color_results?.length || 0}</span>
            </div>
          </div>

          <div className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full opacity-60"></div>
        </div>

        {/* Scientific Action Button */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2 rtl:space-x-reverse">
            <div className="precision-indicator confidence-excellent">
              <BeakerIcon className="h-3 w-3" />
              <span className="text-xs">{lang === 'ar' ? 'جاهز' : 'Ready'}</span>
            </div>
          </div>

          <div className="flex items-center text-primary-600 text-sm font-semibold group-hover:text-primary-700 transition-colors">
            <span className="mr-2 rtl:ml-2 rtl:mr-0">
              {lang === 'ar' ? 'بدء التحليل' : 'Start Analysis'}
            </span>
            <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Click Ripple Effect */}
      <div className="absolute inset-0 bg-primary-500/10 scale-0 group-active:scale-100 transition-transform duration-150 rounded-xl pointer-events-none" />
    </div>
  );
}
