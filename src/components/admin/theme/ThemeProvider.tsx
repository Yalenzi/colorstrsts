'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type CustomTheme = 'blue' | 'teal' | 'purple' | 'green';

interface ThemeContextType {
  mode: ThemeMode;
  customTheme: CustomTheme;
  toggleMode: () => void;
  setCustomTheme: (theme: CustomTheme) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  defaultCustomTheme?: CustomTheme;
}

export function ThemeProvider({ 
  children, 
  defaultMode = 'light',
  defaultCustomTheme = 'blue'
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const [customTheme, setCustomThemeState] = useState<CustomTheme>(defaultCustomTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('admin-theme-mode') as ThemeMode;
      const savedCustomTheme = localStorage.getItem('admin-custom-theme') as CustomTheme;
      
      if (savedMode && ['light', 'dark'].includes(savedMode)) {
        setMode(savedMode);
      }
      
      if (savedCustomTheme && ['blue', 'teal', 'purple', 'green'].includes(savedCustomTheme)) {
        setCustomThemeState(savedCustomTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isLoading) return;

    const root = document.documentElement;
    
    // Apply theme mode
    root.setAttribute('data-theme', mode);
    
    // Apply custom theme
    root.setAttribute('data-custom-theme', customTheme);
    
    // Add admin theme class
    document.body.classList.add('admin-theme');
    
    // Save to localStorage
    try {
      localStorage.setItem('admin-theme-mode', mode);
      localStorage.setItem('admin-custom-theme', customTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [mode, customTheme, isLoading]);

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setCustomTheme = (theme: CustomTheme) => {
    setCustomThemeState(theme);
  };

  const value: ThemeContextType = {
    mode,
    customTheme,
    toggleMode,
    setCustomTheme,
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme utility functions
export const themeUtils = {
  // Get CSS variable value
  getCSSVariable: (variable: string): string => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
  },

  // Set CSS variable value
  setCSSVariable: (variable: string, value: string): void => {
    if (typeof window === 'undefined') return;
    document.documentElement.style.setProperty(variable, value);
  },

  // Get theme colors
  getThemeColors: () => ({
    primary: {
      50: themeUtils.getCSSVariable('--admin-primary-50'),
      100: themeUtils.getCSSVariable('--admin-primary-100'),
      200: themeUtils.getCSSVariable('--admin-primary-200'),
      300: themeUtils.getCSSVariable('--admin-primary-300'),
      400: themeUtils.getCSSVariable('--admin-primary-400'),
      500: themeUtils.getCSSVariable('--admin-primary-500'),
      600: themeUtils.getCSSVariable('--admin-primary-600'),
      700: themeUtils.getCSSVariable('--admin-primary-700'),
      800: themeUtils.getCSSVariable('--admin-primary-800'),
      900: themeUtils.getCSSVariable('--admin-primary-900'),
    },
    gray: {
      50: themeUtils.getCSSVariable('--admin-gray-50'),
      100: themeUtils.getCSSVariable('--admin-gray-100'),
      200: themeUtils.getCSSVariable('--admin-gray-200'),
      300: themeUtils.getCSSVariable('--admin-gray-300'),
      400: themeUtils.getCSSVariable('--admin-gray-400'),
      500: themeUtils.getCSSVariable('--admin-gray-500'),
      600: themeUtils.getCSSVariable('--admin-gray-600'),
      700: themeUtils.getCSSVariable('--admin-gray-700'),
      800: themeUtils.getCSSVariable('--admin-gray-800'),
      900: themeUtils.getCSSVariable('--admin-gray-900'),
    },
    success: {
      400: themeUtils.getCSSVariable('--admin-success-400'),
      500: themeUtils.getCSSVariable('--admin-success-500'),
      600: themeUtils.getCSSVariable('--admin-success-600'),
    },
    warning: {
      400: themeUtils.getCSSVariable('--admin-warning-400'),
      500: themeUtils.getCSSVariable('--admin-warning-500'),
      600: themeUtils.getCSSVariable('--admin-warning-600'),
    },
    error: {
      400: themeUtils.getCSSVariable('--admin-error-400'),
      500: themeUtils.getCSSVariable('--admin-error-500'),
      600: themeUtils.getCSSVariable('--admin-error-600'),
    },
    teal: {
      400: themeUtils.getCSSVariable('--admin-teal-400'),
      500: themeUtils.getCSSVariable('--admin-teal-500'),
      600: themeUtils.getCSSVariable('--admin-teal-600'),
    },
    purple: {
      400: themeUtils.getCSSVariable('--admin-purple-400'),
      500: themeUtils.getCSSVariable('--admin-purple-500'),
      600: themeUtils.getCSSVariable('--admin-purple-600'),
    }
  }),

  // Theme presets
  themePresets: {
    blue: {
      name: 'Professional Blue',
      name_ar: 'الأزرق المهني',
      primary: '#1d4ed8',
      description: 'Classic professional blue theme',
      description_ar: 'الثيم الأزرق المهني الكلاسيكي'
    },
    teal: {
      name: 'Modern Teal',
      name_ar: 'التركواز العصري',
      primary: '#0d9488',
      description: 'Fresh and modern teal theme',
      description_ar: 'ثيم التركواز العصري والمنعش'
    },
    purple: {
      name: 'Creative Purple',
      name_ar: 'البنفسجي الإبداعي',
      primary: '#7c3aed',
      description: 'Creative and innovative purple theme',
      description_ar: 'الثيم البنفسجي الإبداعي والمبتكر'
    },
    green: {
      name: 'Nature Green',
      name_ar: 'الأخضر الطبيعي',
      primary: '#16a34a',
      description: 'Natural and calming green theme',
      description_ar: 'الثيم الأخضر الطبيعي والمهدئ'
    }
  }
};

// Hook for theme animations
export function useThemeTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = () => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return { isTransitioning, startTransition };
}

// Theme configuration constants
export const THEME_CONFIG = {
  STORAGE_KEYS: {
    MODE: 'admin-theme-mode',
    CUSTOM_THEME: 'admin-custom-theme',
    SIDEBAR_COLLAPSED: 'admin-sidebar-collapsed'
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536
  },
  SIDEBAR: {
    WIDTH: 280,
    COLLAPSED_WIDTH: 64
  },
  HEADER: {
    HEIGHT: 64
  },
  TRANSITIONS: {
    FAST: '150ms',
    NORMAL: '250ms',
    SLOW: '350ms'
  }
} as const;
