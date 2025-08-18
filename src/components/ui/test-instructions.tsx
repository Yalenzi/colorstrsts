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
  CheckCircleIcon
} from '@heroicons/react/24/outline';

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

export function TestInstructions({ testId, lang, onComplete, onCancel }: TestInstructionsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([]);
  const [testData, setTestData] = useState<any>(null);
  const [prepareSteps, setPrepareSteps] = useState<string[]>([]);
  const t = getTranslationsSync(lang);

  useEffect(() => {
    // Load test data
    const test = getTestById(testId);
    setTestData(test);

    if (test?.prepare) {
      // Parse prepare field into steps
      const steps = (lang === 'ar' ? test.prepare_ar || test.prepare : test.prepare)
        .split('\n')
        .filter(step => step.trim() !== '')
        .map(step => step.replace(/^\d+\.\s*/, '')); // Remove numbering
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
        ar: 'ضع كمية صغيرة جداً من العينة (حجم حبة الأرز) على طبق خزفي أبيض نظيف. استخدم ملقط أو أداة معدنية نظيفة لنقل العينة.',
        en: 'Place a very small amount of sample (rice grain size) on a clean white ceramic plate. Use clean tweezers or metal tool to transfer the sample.'
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
        ar: 'باستخدام قطارة زجاجية نظيفة، أضف قطرة واحدة فقط من الكاشف على العينة. أمسك القطارة بزاوية 45 درجة وأضف القطرة ببطء.',
        en: 'Using a clean glass dropper, add exactly one drop of reagent to the sample. Hold the dropper at 45-degree angle and add the drop slowly.'
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
        ar: 'راقب تغير اللون فوراً بعد إضافة الكاشف. سجل اللون الأولي الذي يظهر خلال أول 15-30 ثانية. لا تنتظر أكثر من دقيقة واحدة.',
        en: 'Observe color change immediately after adding reagent. Record the initial color that appears within the first 15-30 seconds. Do not wait more than one minute.'
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

  const handleStepComplete = (stepIndex: number) => {
    const newCompleted = [...completed];
    newCompleted[stepIndex] = true;
    setCompleted(newCompleted);

    if (stepIndex < instructions.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  const allStepsCompleted = completed.length === instructions.length && 
    completed.every(step => step === true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="mr-4 rtl:ml-4 rtl:mr-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {testData?.method_name || (lang === 'ar' ? 'اختبار كيميائي' : 'Chemical Test')}
          </h1>
        </div>

        {/* Test Instructions Card */}
        <div className="lab-card mb-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <BeakerIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {lang === 'ar' ? 'تعليمات الاختبار' : 'Test Instructions'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {lang === 'ar'
                  ? 'اتبع هذه الخطوات بدقة وحذر شديد لضمان سلامتك الشخصية والحصول على نتائج موثوقة ودقيقة'
                  : 'Follow these steps precisely and with extreme caution to ensure your personal safety and obtain reliable, accurate results'
                }
              </p>
            </div>
          </div>
        </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {lang === 'ar' ? 'التقدم' : 'Progress'}
          </span>
          <span className="text-sm text-muted-foreground">
            {completed.filter(Boolean).length} / {instructions.length}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(completed.filter(Boolean).length / instructions.length) * 100}%` 
            }}
          />
        </div>
      </div>

        {/* Instructions Steps */}
        <div className="lab-card mb-6">
          <div className="space-y-4">
            {instructions.map((instruction, index) => (
              <div
                key={instruction.id}
                className={`
                  flex items-start space-x-4 rtl:space-x-reverse p-4 rounded-lg transition-all duration-300
                  ${index === currentStep
                    ? 'bg-primary-50 dark:bg-primary-950 border-l-4 border-primary-500'
                    : completed[index]
                      ? 'bg-green-50 dark:bg-green-950 border-l-4 border-green-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                  ${index > currentStep ? 'opacity-60' : 'opacity-100'}
                `}
              >
                {/* Step Number Circle */}
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${completed[index]
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }
                `}>
                  {completed[index] ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    instruction.step
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-foreground leading-relaxed">
                    {lang === 'ar' ? instruction.description.ar : instruction.description.en}
                  </p>

                  {instruction.warning && (
                    <div className="mt-2 flex items-start space-x-2 rtl:space-x-reverse p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-red-700 dark:text-red-300">
                        {lang === 'ar' ? instruction.warning.ar : instruction.warning.en}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Acknowledgment */}
        <div className="lab-card">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {lang === 'ar' ? 'إقرار السلامة' : 'Safety Acknowledgment'}
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="safety-acknowledgment"
                checked={allStepsCompleted}
                onChange={() => {}}
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                disabled
              />
              <label htmlFor="safety-acknowledgment" className="text-sm text-foreground">
                {lang === 'ar'
                  ? 'لقد قرأت وفهمت جميع تعليمات السلامة وسأتبع إجراءات السلامة المناسبة'
                  : 'I have read and understand all safety instructions and will follow proper safety procedures'
                }
              </label>
            </div>

            <Button
              onClick={handleFinish}
              disabled={!allStepsCompleted}
              className={`w-full ${allStepsCompleted
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              size="lg"
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>
                  {allStepsCompleted
                    ? (lang === 'ar' ? 'بدء التحليل' : 'Start Analysis')
                    : (lang === 'ar' ? 'إقرار السلامة مطلوب' : 'Safety Acknowledgment Required')
                  }
                </span>
              </div>
            </Button>
          </div>
        </div>

        {/* Complete Current Step Button */}
        {currentStep < instructions.length && !completed[currentStep] && (
          <div className="mt-6">
            <Button
              onClick={() => handleStepComplete(currentStep)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
              size="lg"
            >
              {lang === 'ar' ? 'تم قراءة هذه الخطوة' : 'Mark Step as Read'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
