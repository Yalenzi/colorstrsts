'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
}

// Mobile-first container with scientific design
export function MobileOptimizedContainer({ children, className }: MobileOptimizedProps) {
  return (
    <div className={cn(
      "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      "transition-all duration-300 ease-in-out",
      className
    )}>
      {children}
    </div>
  );
}

// Scientific card optimized for mobile
export function MobileScientificCard({ children, className }: MobileOptimizedProps) {
  return (
    <div className={cn(
      "lab-card p-4 sm:p-6 lg:p-8",
      "w-full min-h-[120px]",
      "touch-manipulation",
      "active:scale-95 transition-transform duration-150",
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized button for field use
interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'scientific';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function MobileScientificButton({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  className,
  disabled = false
}: MobileButtonProps) {
  const baseClasses = "btn-scientific w-full touch-manipulation active:scale-95 transition-all duration-150 font-semibold";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg",
    secondary: "bg-gradient-to-r from-secondary-600 to-secondary-700 text-white shadow-lg",
    scientific: "bg-gradient-to-r from-lab-primary to-lab-secondary text-white shadow-lg"
  };
  
  const sizeClasses = {
    sm: "h-12 px-4 text-sm",
    md: "h-14 px-6 text-base",
    lg: "h-16 px-8 text-lg"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

// Mobile-optimized text for readability
interface MobileTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  className?: string;
}

export function MobileOptimizedText({ children, variant = 'body', className }: MobileTextProps) {
  const variantClasses = {
    h1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight",
    h2: "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight",
    h3: "text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-tight",
    body: "text-base sm:text-lg leading-relaxed",
    caption: "text-sm sm:text-base text-muted-foreground"
  };
  
  const Component = variant.startsWith('h') ? variant as 'h1' | 'h2' | 'h3' : 'p';
  
  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
}

// Mobile-optimized grid for scientific data
interface MobileGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MobileScientificGrid({ 
  children, 
  columns = 2, 
  gap = 'md',
  className 
}: MobileGridProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  };
  
  const gapClasses = {
    sm: "gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8"
  };
  
  return (
    <div className={cn(
      "grid",
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized precision indicator
interface MobilePrecisionProps {
  level: 'high' | 'medium' | 'low';
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MobilePrecisionIndicator({ 
  level, 
  label, 
  icon,
  className 
}: MobilePrecisionProps) {
  const levelClasses = {
    high: "precision-high",
    medium: "precision-medium", 
    low: "precision-low"
  };
  
  return (
    <div className={cn(
      "precision-indicator",
      levelClasses[level],
      "text-sm sm:text-base",
      "px-3 py-2 sm:px-4 sm:py-2",
      className
    )}>
      {icon && <span className="mr-2 rtl:ml-2 rtl:mr-0">{icon}</span>}
      <span className="font-medium">{label}</span>
    </div>
  );
}

// Mobile-optimized loading state
export function MobileScientificLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-secondary-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
      </div>
      {message && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {message}
        </p>
      )}
    </div>
  );
}

// Mobile-optimized scientific progress bar
interface MobileProgressProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function MobileScientificProgress({ 
  progress, 
  label, 
  showPercentage = true,
  className 
}: MobileProgressProps) {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-precision font-mono font-semibold">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div className="progress-scientific h-3 sm:h-4">
        <div 
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// Mobile-optimized touch-friendly tabs
interface MobileTabsProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MobileScientificTabs({ 
  tabs, 
  activeTab, 
  onTabChange,
  className 
}: MobileTabsProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex overflow-x-auto scrollbar-hide border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200",
              "border-b-2 min-w-[120px] touch-manipulation",
              activeTab === tab.id
                ? "border-primary-500 text-primary-600 bg-primary-50"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              {tab.icon && <span className="text-lg">{tab.icon}</span>}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
