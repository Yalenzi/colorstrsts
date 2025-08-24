'use client';

import React from 'react';
import {
  ShieldCheckIcon,
  EyeIcon,
  HandRaisedIcon,
  FireIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  EyeDropperIcon,
  CubeIcon,
  SparklesIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// مكون الإطار المخصص المحسن
interface EnhancedInstructionFrameProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: 'safety' | 'equipment' | 'procedure' | 'chemicals' | 'instructions' | 'acknowledgment';
  className?: string;
}

export function EnhancedInstructionFrame({ 
  title, 
  icon, 
  children, 
  variant = 'safety', 
  className = '' 
}: EnhancedInstructionFrameProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'safety':
        return 'instruction-frame safety border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900';
      case 'equipment':
        return 'instruction-frame equipment border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900';
      case 'procedure':
        return 'instruction-frame procedure border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900';
      case 'chemicals':
        return 'instruction-frame chemicals border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900';
      case 'instructions':
        return 'instruction-frame instructions border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900';
      case 'acknowledgment':
        return 'instruction-frame acknowledgment border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800';
      default:
        return 'instruction-frame border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
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
    <div className={`${getVariantStyles()} ${className}`}>
      <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
        <div className={`instruction-icon-container ${getIconColor()}`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// مكون النقاط المحسن مع الأيقونات
interface EnhancedBulletPointProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
}

export function EnhancedBulletPoint({ icon, text, className = '' }: EnhancedBulletPointProps) {
  return (
    <div className={`instruction-bullet ${className}`}>
      <div className="instruction-bullet-icon">
        {icon}
      </div>
      <p className="text-foreground leading-relaxed font-medium">{text}</p>
    </div>
  );
}

// مكون الخطوات المرقمة المحسن
interface EnhancedNumberedStepProps {
  number: number;
  text: string;
  className?: string;
}

export function EnhancedNumberedStep({ number, text, className = '' }: EnhancedNumberedStepProps) {
  return (
    <div className={`instruction-step ${className}`}>
      <div className="instruction-step-number">
        {number}
      </div>
      <p className="text-foreground leading-relaxed font-medium pt-1">{text}</p>
    </div>
  );
}

// مكون إقرار السلامة المحسن
interface EnhancedSafetyAcknowledgmentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  text: string;
  buttonText: string;
  onSubmit: () => void;
  className?: string;
}

export function EnhancedSafetyAcknowledgment({
  checked,
  onChange,
  text,
  buttonText,
  onSubmit,
  className = ''
}: EnhancedSafetyAcknowledgmentProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      <div className="instruction-acknowledgment">
        <div className="flex items-start space-x-4 rtl:space-x-reverse">
          <input
            type="checkbox"
            id="enhanced-safety-acknowledgment"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="instruction-acknowledgment-checkbox"
          />
          <label 
            htmlFor="enhanced-safety-acknowledgment" 
            className="text-lg text-foreground leading-relaxed font-medium cursor-pointer"
          >
            {text}
          </label>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onSubmit}
          disabled={!checked}
          className={`instruction-start-button ${!checked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
            {checked ? (
              <CheckCircleIcon className="h-6 w-6" />
            ) : (
              <ExclamationTriangleIcon className="h-6 w-6" />
            )}
            <span>{buttonText}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

// مكون العنوان المحسن
interface EnhancedHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  className?: string;
}

export function EnhancedHeader({ title, subtitle, onBack, className = '' }: EnhancedHeaderProps) {
  return (
    <div className={`flex items-center mb-10 ${className}`}>
      <button
        onClick={onBack}
        className="mr-6 rtl:ml-6 rtl:mr-0 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-muted-foreground font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// مكون الأيقونات المخصصة
export const InstructionIcons = {
  Safety: ShieldCheckIcon,
  Eye: EyeIcon,
  Hand: HandRaisedIcon,
  Fire: FireIcon,
  Beaker: BeakerIcon,
  Warning: ExclamationTriangleIcon,
  Dropper: EyeDropperIcon,
  Cube: CubeIcon,
  Sparkles: SparklesIcon,
  Document: DocumentTextIcon,
  Check: CheckCircleIcon
};

// مكون مجموعة الأيقونات للسلامة
export function SafetyEquipmentIcons() {
  return {
    goggles: <EyeIcon className="w-5 h-5" />,
    gloves: <HandRaisedIcon className="w-5 h-5" />,
    ventilation: <FireIcon className="w-5 h-5" />,
    testPlate: <BeakerIcon className="w-5 h-5" />,
    warning: <ExclamationTriangleIcon className="w-5 h-5" />,
    dropper: <EyeDropperIcon className="w-5 h-5" />
  };
}

// مكون مجموعة الأيقونات للمواد الكيميائية
export function ChemicalIcons() {
  return {
    chemical: <SparklesIcon className="w-5 h-5" />,
    water: <EyeDropperIcon className="w-5 h-5" />,
    reagent: <BeakerIcon className="w-5 h-5" />,
    container: <CubeIcon className="w-5 h-5" />
  };
}
