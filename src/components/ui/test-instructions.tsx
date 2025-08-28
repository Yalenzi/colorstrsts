'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { getTestById } from '@/lib/local-data-service';
import { Button } from '@/components/ui/button';
import {
  ExclamationTriangleIcon,
  EyeIcon,
  ShieldCheckIcon,
  ClockIcon,
  BeakerIcon,
  CheckCircleIcon,
  EyeDropperIcon,
  CubeIcon,
  DocumentTextIcon,
  HandRaisedIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  EnhancedInstructionFrame,
  EnhancedBulletPoint,
  EnhancedNumberedStep,
  EnhancedSafetyAcknowledgment,
  EnhancedHeader,
  SafetyEquipmentIcons,
  ChemicalIcons
} from './instruction-components';

interface TestInstruction {
  id: string;
  step: number;
  title: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  warning?: {
    ar: string;
    en: string;
  };
  icon: string;
  duration?: string;
}

interface TestInstructionsProps {
  testId: string;
  lang: Language;
  onComplete: () => void;
  onCancel: () => void;
}

// مكون الإطار المخصص
interface InstructionFrameProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: 'safety' | 'equipment' | 'procedure' | 'chemicals' | 'instructions' | 'acknowledgment';
  className?: string;
}

function InstructionFrame({ title, icon, children, variant = 'safety', className = '' }: InstructionFrameProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'safety':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950';
      case 'equipment':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950';
      case 'procedure':
        return 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950';
      case 'chemicals':
        return 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950';
      case 'instructions':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950';
      case 'acknowledgment':
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'safety':
        return 'text-red-600 dark:text-red-400';
      case 'equipment':
        return 'text-blue-600 dark:text-blue-400';
      case 'procedure':
        return 'text-orange-600 dark:text-orange-400';
      case 'chemicals':
        return 'text-purple-600 dark:text-purple-400';
      case 'instructions':
        return 'text-green-600 dark:text-green-400';
      case 'acknowledgment':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={`rounded-xl border-2 ${getVariantStyles()} p-6 mb-6 ${className}`}>
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
        <div className={`w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm ${getIconColor()}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// مكون النقاط مع الأيقونات
interface BulletPointProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
}

function BulletPoint({ icon, text, className = '' }: BulletPointProps) {
  return (
    <div className={`flex items-start space-x-3 rtl:space-x-reverse mb-3 ${className}`}>
      <div className="flex-shrink-0 w-6 h-6 text-current mt-0.5">
        {icon}
      </div>
      <p className="text-foreground leading-relaxed">{text}</p>
    </div>
  );
}

// مكون الخطوات المرقمة
interface NumberedStepProps {
  number: number;
  text: string;
  className?: string;
}

function NumberedStep({ number, text, className = '' }: NumberedStepProps) {
  return (
    <div className={`flex items-start space-x-4 rtl:space-x-reverse mb-4 ${className}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
        {number}
      </div>
      <p className="text-foreground leading-relaxed pt-1">{text}</p>
    </div>
  );
}

export function TestInstructions({ testId, lang, onComplete, onCancel }: TestInstructionsProps) {
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [prepareSteps, setPrepareSteps] = useState<string[]>([]);
  const t = getTranslationsSync(lang);

  useEffect(() => {
    // Load test data
    const test = getTestById(testId);
    setTestData(test);

    if (test?.prepare) {
      // Parse prepare field into steps - handle both \n and numbered steps
      const prepareText = lang === 'ar' ? test.prepare_ar || test.prepare : test.prepare;

      let steps: string[] = [];

      // First try to split by \n (for properly formatted data)
      if (prepareText.includes('\n')) {
        steps = prepareText
          .split('\n')
          .filter(step => step.trim() !== '')
          .map(step => step.replace(/^\d+\.\s*/, '')); // Remove numbering
      } else {
        // Fallback: split by numbered steps pattern for old format
        steps = prepareText
          .split(/(?=\d+\.\s)/) // Split before numbered steps
          .filter(step => step.trim() !== '')
          .map(step => step.replace(/^\d+\.\s*/, '')); // Remove numbering
      }

      setPrepareSteps(steps);
    }
  }, [testId, lang]);

  // Default instructions for all tests
  const defaultInstructions: TestInstruction[] = [
    {
      id: 'safety',
      step: 1,
      title: {
        ar: 'إجراءات السلامة والحماية',
        en: 'Safety and Protection Procedures'
      },
      description: {
        ar: 'ارتدِ القفازات المقاومة للمواد الكيميائية ونظارات الأمان الواقية. تأكد من وجود تهوية ممتازة في المكان وأبعد المواد القابلة للاشتعال من منطقة العمل.',
        en: 'Wear chemical-resistant gloves and protective safety goggles. Ensure excellent ventilation in the area and remove flammable materials from work area.'
      },
      warning: {
        ar: 'خطر: لا تلمس الكواشف الكيميائية مباشرة - قد تسبب حروق كيميائية شديدة',
        en: 'DANGER: Never touch chemical reagents directly - may cause severe chemical burns'
      },
      icon: 'shield',
      duration: '3 min'
    },
    {
      id: 'preparation',
      step: 2,
      title: {
        ar: 'تحضير العينة والأدوات',
        en: 'Sample and Equipment Preparation'
      },
      description: {
        ar: 'ضع كمية صغيرة من المادة المشتبه بها على لوحة البقعة البيضاء النظيفة (حجم حبة الأرز تقريباً).',
        en: 'Place a small amount of suspected material on a clean white spot plate (approximately rice grain size).'
      },
      warning: {
        ar: 'تجنب استخدام الأسطح البلاستيكية - قد تتفاعل مع الكواشف',
        en: 'Avoid plastic surfaces - they may react with reagents'
      },
      icon: 'beaker',
      duration: '2 min'
    },
    {
      id: 'reagent',
      step: 3,
      title: {
        ar: 'إضافة الكاشف الكيميائي',
        en: 'Add Chemical Reagent'
      },
      description: {
        ar: 'أضف قطرة واحدة من الكاشف الكيميائي على العينة باستخدام قطارة زجاجية نظيفة.',
        en: 'Add one drop of chemical reagent to the sample using a clean glass dropper.'
      },
      warning: {
        ar: 'تحذير: لا تضع أكثر من قطرة واحدة - قد يؤثر على دقة النتائج',
        en: 'WARNING: Do not add more than one drop - may affect result accuracy'
      },
      icon: 'eye',
      duration: '1 min'
    },
    {
      id: 'observation',
      step: 4,
      title: {
        ar: 'مراقبة وتسجيل التفاعل',
        en: 'Observe and Record Reaction'
      },
      description: {
        ar: 'راقب تغير اللون فوراً بعد إضافة الكاشف وسجل النتيجة خلال أول دقيقة.',
        en: 'Observe color change immediately after adding reagent and record the result within the first minute.'
      },
      warning: {
        ar: 'مهم: اللون الأولي هو الأكثر دقة - التغيرات اللاحقة قد تكون مضللة',
        en: 'IMPORTANT: Initial color is most accurate - later changes may be misleading'
      },
      icon: 'clock',
      duration: '1 min'
    },
    {
      id: 'cleanup',
      step: 5,
      title: {
        ar: 'التنظيف والتخلص الآمن',
        en: 'Safe Cleanup and Disposal'
      },
      description: {
        ar: 'اتركي العينة والكاشف يجفان تماماً، ثم تخلص منهما في حاوية النفايات الكيميائية المخصصة. اغسل جميع الأدوات بالماء والصابون، ثم اغسل يديك جيداً.',
        en: 'Allow sample and reagent to dry completely, then dispose in designated chemical waste container. Wash all tools with soap and water, then wash hands thoroughly.'
      },
      warning: {
        ar: 'ممنوع: لا تتخلص من الكواشف في المجاري أو سلة المهملات العادية',
        en: 'PROHIBITED: Never dispose of reagents in drains or regular trash'
      },
      icon: 'check',
      duration: '3 min'
    }
  ];

  // Generate instructions based on test data
  const generateInstructions = (): TestInstruction[] => {
    if (!testData || prepareSteps.length === 0) {
      // Return default instructions if no specific prepare data
      return defaultInstructions;
    }

    const instructions: TestInstruction[] = [];

    // Add safety instruction first
    instructions.push({
      id: 'safety',
      step: 1,
      title: {
        ar: 'إجراءات السلامة والحماية',
        en: 'Safety and Protection Procedures'
      },
      description: {
        ar: `• ارتدِ القفازات المقاومة للمواد الكيميائية
• ارتدِ نظارات الأمان الواقية
• تأكد من وجود تهوية ممتازة في المكان
• أبعد المواد القابلة للاشتعال من منطقة العمل
• تأكد من وجود مواد الإسعافات الأولية`,
        en: `• Wear chemical-resistant gloves
• Wear protective safety goggles
• Ensure excellent ventilation in the area
• Remove flammable materials from work area
• Ensure first aid materials are available`
      },
      warning: {
        ar: `خطر: ${testData.method_name_ar} يتطلب احتياطات خاصة`,
        en: `DANGER: ${testData.method_name} requires special precautions`
      },
      icon: 'shield',
      duration: '3 min'
    });

    // Add prepare steps
    prepareSteps.forEach((step, index) => {
      instructions.push({
        id: `prepare-${index + 1}`,
        step: index + 2,
        title: {
          ar: `خطوة ${index + 1}: ${step.substring(0, 30)}...`,
          en: `Step ${index + 1}: ${step.substring(0, 30)}...`
        },
        description: {
          ar: step,
          en: step
        },
        warning: index === 0 ? {
          ar: 'تأكد من استخدام كمية صغيرة جداً من العينة',
          en: 'Ensure to use a very small amount of sample'
        } : undefined,
        icon: index === 0 ? 'beaker' : index === prepareSteps.length - 1 ? 'eye' : 'clock',
        duration: '2 min'
      });
    });

    // Add cleanup step
    instructions.push({
      id: 'cleanup',
      step: instructions.length + 1,
      title: {
        ar: 'التنظيف والتخلص الآمن',
        en: 'Cleanup and Safe Disposal'
      },
      description: {
        ar: 'تخلص من جميع المواد بطريقة آمنة واغسل يديك جيداً.',
        en: 'Dispose of all materials safely and wash hands thoroughly.'
      },
      warning: {
        ar: 'لا تتخلص من الكواشف في المجاري العادية',
        en: 'Never dispose of reagents in regular drains'
      },
      icon: 'check',
      duration: '3 min'
    });

    return instructions;
  };

  const instructions = generateInstructions();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return <ShieldCheckIcon className="h-6 w-6" />;
      case 'beaker':
        return <BeakerIcon className="h-6 w-6" />;
      case 'eye':
        return <EyeIcon className="h-6 w-6" />;
      case 'clock':
        return <ClockIcon className="h-6 w-6" />;
      case 'check':
        return <CheckCircleIcon className="h-6 w-6" />;
      default:
        return <ExclamationTriangleIcon className="h-6 w-6" />;
    }
  };

  const handleSafetyAcknowledgment = (checked: boolean) => {
    setSafetyAcknowledged(checked);
  };

  const handleFinish = () => {
    if (safetyAcknowledged) {
      onComplete();
    }
  };

  // إنشاء أيقونات السلامة والمواد الكيميائية
  const safetyIcons = SafetyEquipmentIcons();
  const chemicalIcons = ChemicalIcons();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Center the entire Safety Instructions Card horizontally */}
      <div className="flex justify-center min-h-screen py-8">
        <div className="w-full max-w-4xl px-4 space-y-6">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {testData ? (lang === 'ar' ? testData.method_name_ar : testData.method_name) : (lang === 'ar' ? 'اختبار كيميائي' : 'Chemical Test')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {lang === 'ar' ? 'تعليمات السلامة والإجراءات' : 'Safety Instructions and Procedures'}
            </p>
          </div>

          {/* Required Equipment Section */}
          {/* Title Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <EyeDropperIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {lang === 'ar' ? 'المعدات المطلوبة' : 'Required Equipment'}
              </h2>
            </div>
          </div>

          {/* Equipment List Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <EyeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">{lang === 'ar' ? 'نظارات أمان واقية' : 'Protective safety goggles'}</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <ShieldCheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">{lang === 'ar' ? 'قفازات مقاومة للمواد الكيميائية' : 'Chemical-resistant gloves'}</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <EyeDropperIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">{lang === 'ar' ? 'قطارة زجاجية نظيفة' : 'Clean glass dropper'}</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <CubeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">{lang === 'ar' ? 'طبق نقطي' : 'Spot plate'}</span>
              </div>
            </div>
          </div>

          {/* Handling Procedures Section - Title and Content in Single Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <HandRaisedIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {lang === 'ar' ? 'إجراءات التعامل' : 'Handling Procedures'}
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <ShieldCheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">{lang === 'ar' ? 'ارتدِ القفازات المقاومة للمواد الكيميائية' : 'Wear chemical-resistant gloves'}</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <EyeIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">{lang === 'ar' ? 'استخدم نظارات الأمان الواقية' : 'Use protective safety goggles'}</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">{lang === 'ar' ? 'تأكد من التهوية الجيدة' : 'Ensure proper ventilation'}</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">{lang === 'ar' ? 'تجنب ملامسة الجلد' : 'Avoid skin contact'}</span>
              </div>
              {/* Display safety warnings from database */}
              {testData?.instructions && testData.instructions.length > 0 && (
                testData.instructions.map((instruction: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mt-1">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-red-700 dark:text-red-300 font-medium">
                      {lang === 'ar' ? instruction.safety_warning_ar : instruction.safety_warning}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chemical Components Section */}
          {/* Title Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <CubeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {lang === 'ar' ? 'المكونات الكيميائية' : 'Chemical Components'}
              </h2>
            </div>
          </div>

          {/* Components List Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="space-y-4">
              {/* Display chemical components from database */}
              {testData?.chemical_components && testData.chemical_components.length > 0 ? (
                testData.chemical_components.map((component: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <BeakerIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-gray-900 dark:text-gray-100">
                      {lang === 'ar' ? component.name_ar : component.name}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <BeakerIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-gray-900 dark:text-gray-100">
                      {testData ? (lang === 'ar' ? `كاشف ${testData.method_name_ar}` : `${testData.method_name} Reagent`) : (lang === 'ar' ? 'الكاشف الكيميائي' : 'Chemical Reagent')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <BeakerIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-gray-900 dark:text-gray-100">
                      {lang === 'ar' ? 'الماء المقطر' : 'Distilled Water'}
                    </span>
                  </div>
                </>
              )}

              {/* Always add test plate */}
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <CubeIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">
                  {lang === 'ar' ? 'طبق اختبار نظيف' : 'Clean test plate'}
                </span>
              </div>
            </div>
          </div>

          {/* Test Instructions Section */}
          {/* Title Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {lang === 'ar' ? 'تعليمات الاختبار' : 'Test Instructions'}
              </h2>
            </div>
          </div>

          {/* Instructions List Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="space-y-4">
              {prepareSteps.length > 0 ? (
                prepareSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{index + 1}</span>
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 leading-relaxed">{step}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">1</span>
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {lang === 'ar' ? 'ضع عينة صغيرة على طبق الاختبار' : 'Place a small sample on the test plate'}
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">2</span>
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {lang === 'ar' ? 'أضف ثلاث قطرات من الماء واخلط' : 'Add three drops of water and mix'}
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">3</span>
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {lang === 'ar' ? 'انقل القطرة إلى تجويف آخر' : 'Transfer the drop to another cavity'}
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">4</span>
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {testData ? (lang === 'ar' ? `أضف قطرة من كاشف ${testData.method_name_ar}` : `Add one drop of ${testData.method_name} reagent`) : (lang === 'ar' ? 'أضف قطرة من الكاشف الكيميائي' : 'Add one drop of chemical reagent')}
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">5</span>
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {testData ? (lang === 'ar' ? `راقب تغير اللون - ${testData.color_result_ar || 'انتظر النتيجة'}` : `Observe color change - ${testData.color_result || 'wait for result'}`) : (lang === 'ar' ? 'راقب تغير اللون' : 'Observe color change')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Safety Acknowledgment Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {lang === 'ar' ? 'إقرار السلامة' : 'Safety Acknowledgment'}
              </h2>
            </div>

            <EnhancedSafetyAcknowledgment
              checked={safetyAcknowledged}
              onChange={handleSafetyAcknowledgment}
              text={lang === 'ar'
                ? 'لقد قرأت وفهمت جميع تعليمات السلامة وسأتبع إجراءات السلامة المناسبة أثناء تنفيذ الاختبار'
                : 'I have read and understand all safety instructions and will follow proper safety procedures during test execution'
              }
              buttonText={safetyAcknowledged
                ? (lang === 'ar' ? 'بدء التحليل' : 'Start Analysis')
                : (lang === 'ar' ? 'مطلوب إقرار السلامة' : 'Safety Acknowledgment Required')
              }
              onSubmit={handleFinish}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
