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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* Enhanced Header */}
        <EnhancedHeader
          title={testData ? (lang === 'ar' ? testData.method_name_ar : testData.method_name) : (lang === 'ar' ? 'اختبار كيميائي' : 'Chemical Test')}
          subtitle={testData?.method_name || (lang === 'ar' ? 'اختبار كيميائي متقدم للكشف عن المواد' : 'Advanced Chemical Detection Test')}
          onBack={onCancel}
        />



        {/* إطار تعليمات السلامة المحسن */}
        <EnhancedInstructionFrame
          title={lang === 'ar' ? 'تعليمات السلامة' : 'Safety Instructions'}
          icon={<ShieldCheckIcon className="w-7 h-7" />}
          variant="safety"
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <EyeIcon className="w-6 h-6 mr-3 rtl:ml-3 rtl:mr-0 text-red-600" />
                {lang === 'ar' ? 'المعدات المطلوبة:' : 'Required Equipment:'}
              </h4>
              <div className="space-y-2">
                <EnhancedBulletPoint
                  icon={safetyIcons.goggles}
                  text={lang === 'ar' ? 'نظارات أمان واقية' : 'Protective safety goggles'}
                />
                <EnhancedBulletPoint
                  icon={safetyIcons.gloves}
                  text={lang === 'ar' ? 'قفازات مقاومة للمواد الكيميائية' : 'Chemical-resistant gloves'}
                />
                <EnhancedBulletPoint
                  icon={safetyIcons.ventilation}
                  text={lang === 'ar' ? 'تهوية ممتازة في المكان' : 'Excellent ventilation in the area'}
                />
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <HandRaisedIcon className="w-6 h-6 mr-3 rtl:ml-3 rtl:mr-0 text-red-600" />
                {lang === 'ar' ? 'إجراءات التعامل:' : 'Handling Procedures:'}
              </h4>
              <div className="space-y-2">
                <EnhancedBulletPoint
                  icon={safetyIcons.testPlate}
                  text={lang === 'ar' ? 'استخدم طبق اختبار نظيف' : 'Use a clean test plate'}
                />
                <EnhancedBulletPoint
                  icon={safetyIcons.warning}
                  text={lang === 'ar' ? 'تجنب ملامسة الجلد' : 'Avoid skin contact'}
                />
                <EnhancedBulletPoint
                  icon={safetyIcons.dropper}
                  text={lang === 'ar' ? 'استخدم قطارة زجاجية نظيفة' : 'Use a clean glass dropper'}
                />
                {testData && (
                  <EnhancedBulletPoint
                    icon={safetyIcons.warning}
                    text={testData ? (lang === 'ar' ? `تحذير خاص: كاشف ${testData.method_name_ar} يتطلب احتياطات إضافية` : `Special Warning: ${testData.method_name} reagent requires additional precautions`) : ''}
                  />
                )}
              </div>
            </div>
          </div>
        </EnhancedInstructionFrame>

        {/* إطار المكونات الكيميائية المحسن */}
        <EnhancedInstructionFrame
          title={lang === 'ar' ? 'المكونات الكيميائية' : 'Chemical Components'}
          icon={<CubeIcon className="w-7 h-7" />}
          variant="chemicals"
        >
          <div className="space-y-4">
            <EnhancedBulletPoint
              icon={chemicalIcons.chemical}
              text={testData ? (lang === 'ar' ? `كاشف ${testData.method_name_ar}` : `${testData.method_name} Reagent`) : (lang === 'ar' ? 'الكاشف الكيميائي' : 'Chemical Reagent')}
            />
            <EnhancedBulletPoint
              icon={chemicalIcons.water}
              text={lang === 'ar' ? 'الماء المقطر' : 'Distilled Water'}
            />
            <EnhancedBulletPoint
              icon={chemicalIcons.reagent}
              text={lang === 'ar' ? 'طبق اختبار نظيف' : 'Clean test plate'}
            />
            {testData && (
              <EnhancedBulletPoint
                icon={chemicalIcons.chemical}
                text={testData ? (lang === 'ar' ? `النتيجة المتوقعة: ${testData.color_result_ar || testData.color_result}` : `Expected Result: ${testData.color_result}`) : ''}
              />
            )}
          </div>
        </EnhancedInstructionFrame>

        {/* إطار تعليمات الاختبار المحسن */}
        <EnhancedInstructionFrame
          title={lang === 'ar' ? 'تعليمات الاختبار' : 'Test Instructions'}
          icon={<DocumentTextIcon className="w-7 h-7" />}
          variant="instructions"
        >
          <div className="space-y-5">
            {prepareSteps.length > 0 ? (
              prepareSteps.map((step, index) => (
                <EnhancedNumberedStep
                  key={index}
                  number={index + 1}
                  text={step}
                />
              ))
            ) : (
              <>
                <EnhancedNumberedStep
                  number={1}
                  text={lang === 'ar' ? 'ضع عينة صغيرة على طبق الاختبار' : 'Place a small sample on the test plate'}
                />
                <EnhancedNumberedStep
                  number={2}
                  text={lang === 'ar' ? 'أضف ثلاث قطرات من الماء واخلط' : 'Add three drops of water and mix'}
                />
                <EnhancedNumberedStep
                  number={3}
                  text={lang === 'ar' ? 'انقل القطرة إلى تجويف آخر' : 'Transfer the drop to another cavity'}
                />
                <EnhancedNumberedStep
                  number={4}
                  text={testData ? (lang === 'ar' ? `أضف قطرة من كاشف ${testData.method_name_ar}` : `Add one drop of ${testData.method_name} reagent`) : (lang === 'ar' ? 'أضف قطرة من الكاشف الكيميائي' : 'Add one drop of chemical reagent')}
                />
                <EnhancedNumberedStep
                  number={5}
                  text={testData ? (lang === 'ar' ? `راقب تغير اللون - ${testData.color_result_ar || 'انتظر النتيجة'}` : `Observe color change - ${testData.color_result || 'wait for result'}`) : (lang === 'ar' ? 'راقب تغير اللون' : 'Observe color change')}
                />
              </>
            )}
          </div>
        </EnhancedInstructionFrame>

        {/* إطار إقرار السلامة المحسن */}
        <EnhancedInstructionFrame
          title={lang === 'ar' ? 'إقرار السلامة' : 'Safety Acknowledgment'}
          icon={<CheckCircleIcon className="w-7 h-7" />}
          variant="acknowledgment"
        >
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
        </EnhancedInstructionFrame>
      </div>
    </div>
  );
}
