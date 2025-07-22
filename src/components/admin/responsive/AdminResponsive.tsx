'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';

// Breakpoint constants
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Hook for responsive behavior
export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < BREAKPOINTS.md;
  const isTablet = windowSize.width >= BREAKPOINTS.md && windowSize.width < BREAKPOINTS.lg;
  const isDesktop = windowSize.width >= BREAKPOINTS.lg;
  const isLargeDesktop = windowSize.width >= BREAKPOINTS.xl;

  const getCurrentBreakpoint = (): Breakpoint => {
    if (windowSize.width < BREAKPOINTS.sm) return 'xs';
    if (windowSize.width < BREAKPOINTS.md) return 'sm';
    if (windowSize.width < BREAKPOINTS.lg) return 'md';
    if (windowSize.width < BREAKPOINTS.xl) return 'lg';
    if (windowSize.width < BREAKPOINTS['2xl']) return 'xl';
    return '2xl';
  };

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoint: getCurrentBreakpoint()
  };
}

// Responsive Container Component
export function AdminResponsiveContainer({ 
  children, 
  className = '',
  maxWidth = '2xl',
  padding = 'responsive'
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'tight' | 'normal' | 'loose' | 'responsive';
}) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    tight: 'px-2',
    normal: 'px-4',
    loose: 'px-8',
    responsive: 'px-4 sm:px-6 lg:px-8'
  };

  return (
    <div className={`
      w-full mx-auto
      ${maxWidthClasses[maxWidth]}
      ${paddingClasses[padding]}
      ${className}
    `}>
      {children}
    </div>
  );
}

// Responsive Grid Component
export function AdminResponsiveGrid({ 
  children, 
  cols = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  },
  gap = 'normal',
  className = ''
}: {
  children: React.ReactNode;
  cols?: Partial<Record<Breakpoint, number>>;
  gap?: 'tight' | 'normal' | 'loose';
  className?: string;
}) {
  const gapClasses = {
    tight: 'gap-2',
    normal: 'gap-4',
    loose: 'gap-6'
  };

  const getGridCols = () => {
    const colClasses = [];
    if (cols.xs) colClasses.push(`grid-cols-${cols.xs}`);
    if (cols.sm) colClasses.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`);
    if (cols['2xl']) colClasses.push(`2xl:grid-cols-${cols['2xl']}`);
    return colClasses.join(' ');
  };

  return (
    <div className={`
      grid ${getGridCols()} ${gapClasses[gap]} ${className}
    `}>
      {children}
    </div>
  );
}

// Responsive Text Component
export function AdminResponsiveText({ 
  children, 
  size = {
    xs: 'sm',
    md: 'base',
    lg: 'lg'
  },
  weight = 'normal',
  className = ''
}: {
  children: React.ReactNode;
  size?: Partial<Record<Breakpoint, 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'>>;
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
}) {
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const getSizeClasses = () => {
    const sizeClasses = [];
    if (size.xs) sizeClasses.push(`text-${size.xs}`);
    if (size.sm) sizeClasses.push(`sm:text-${size.sm}`);
    if (size.md) sizeClasses.push(`md:text-${size.md}`);
    if (size.lg) sizeClasses.push(`lg:text-${size.lg}`);
    if (size.xl) sizeClasses.push(`xl:text-${size.xl}`);
    if (size['2xl']) sizeClasses.push(`2xl:text-${size['2xl']}`);
    return sizeClasses.join(' ');
  };

  return (
    <span className={`
      ${getSizeClasses()} ${weightClasses[weight]} ${className}
    `}>
      {children}
    </span>
  );
}

// Mobile Navigation Component
export function AdminMobileNav({ 
  isOpen, 
  onClose, 
  children,
  lang = 'en'
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  lang?: Language;
}) {
  const isRTL = lang === 'ar';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      
      {/* Mobile Menu */}
      <div 
        className={`
          fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-80 bg-white dark:bg-gray-800 
          shadow-xl z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
        `}
      >
        {children}
      </div>
    </>
  );
}

// Responsive Card Component
export function AdminResponsiveCard({ 
  children, 
  padding = 'responsive',
  className = ''
}: {
  children: React.ReactNode;
  padding?: 'responsive' | 'tight' | 'normal' | 'loose';
  className?: string;
}) {
  const paddingClasses = {
    responsive: 'p-4 sm:p-6 lg:p-8',
    tight: 'p-3',
    normal: 'p-6',
    loose: 'p-8'
  };

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700
      ${paddingClasses[padding]} ${className}
    `}>
      {children}
    </div>
  );
}

// Responsive Table Wrapper
export function AdminResponsiveTable({ 
  children, 
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`
      overflow-x-auto -mx-4 sm:mx-0
      scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
      dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800
      ${className}
    `}>
      <div className="inline-block min-w-full align-middle">
        {children}
      </div>
    </div>
  );
}

// Responsive Stack Component
export function AdminResponsiveStack({ 
  children, 
  direction = 'responsive',
  gap = 'normal',
  align = 'stretch',
  className = ''
}: {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'responsive';
  gap?: 'tight' | 'normal' | 'loose';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}) {
  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col',
    responsive: 'flex-col sm:flex-row'
  };

  const gapClasses = {
    tight: 'gap-2',
    normal: 'gap-4',
    loose: 'gap-6'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  return (
    <div className={`
      flex ${directionClasses[direction]} ${gapClasses[gap]} ${alignClasses[align]} ${className}
    `}>
      {children}
    </div>
  );
}

// Responsive Show/Hide Component
export function AdminResponsiveShow({ 
  children, 
  breakpoint,
  above = false,
  className = ''
}: {
  children: React.ReactNode;
  breakpoint: Breakpoint;
  above?: boolean;
  className?: string;
}) {
  const getVisibilityClass = () => {
    const prefix = above ? '' : 'max-';
    const breakpointClass = above ? breakpoint : breakpoint;
    
    if (above) {
      return `hidden ${breakpoint}:block`;
    } else {
      return `block ${breakpoint}:hidden`;
    }
  };

  return (
    <div className={`${getVisibilityClass()} ${className}`}>
      {children}
    </div>
  );
}

// Responsive Sidebar Component
export function AdminResponsiveSidebar({ 
  children, 
  isOpen, 
  onClose,
  width = 'normal',
  lang = 'en'
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  width?: 'narrow' | 'normal' | 'wide';
  lang?: Language;
}) {
  const { isMobile } = useResponsive();
  const isRTL = lang === 'ar';

  const widthClasses = {
    narrow: 'w-64',
    normal: 'w-80',
    wide: 'w-96'
  };

  if (isMobile) {
    return (
      <AdminMobileNav isOpen={isOpen} onClose={onClose} lang={lang}>
        {children}
      </AdminMobileNav>
    );
  }

  return (
    <aside className={`
      fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full ${widthClasses[width]}
      bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
      transform transition-transform duration-300 ease-in-out z-30
      ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
    `}>
      {children}
    </aside>
  );
}

// Responsive Button Group
export function AdminResponsiveButtonGroup({ 
  children, 
  orientation = 'responsive',
  size = 'normal',
  className = ''
}: {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical' | 'responsive';
  size?: 'small' | 'normal' | 'large';
  className?: string;
}) {
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
    responsive: 'flex-col sm:flex-row'
  };

  const sizeClasses = {
    small: 'gap-1',
    normal: 'gap-2',
    large: 'gap-4'
  };

  return (
    <div className={`
      flex ${orientationClasses[orientation]} ${sizeClasses[size]} ${className}
    `}>
      {children}
    </div>
  );
}

// Responsive Image Component
export function AdminResponsiveImage({ 
  src, 
  alt, 
  sizes = {
    xs: 'w-full',
    sm: 'w-1/2',
    md: 'w-1/3',
    lg: 'w-1/4'
  },
  className = ''
}: {
  src: string;
  alt: string;
  sizes?: Partial<Record<Breakpoint, string>>;
  className?: string;
}) {
  const getSizeClasses = () => {
    const sizeClasses = [];
    if (sizes.xs) sizeClasses.push(sizes.xs);
    if (sizes.sm) sizeClasses.push(`sm:${sizes.sm}`);
    if (sizes.md) sizeClasses.push(`md:${sizes.md}`);
    if (sizes.lg) sizeClasses.push(`lg:${sizes.lg}`);
    if (sizes.xl) sizeClasses.push(`xl:${sizes.xl}`);
    if (sizes['2xl']) sizeClasses.push(`2xl:${sizes['2xl']}`);
    return sizeClasses.join(' ');
  };

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`
        ${getSizeClasses()} h-auto object-cover ${className}
      `}
    />
  );
}
