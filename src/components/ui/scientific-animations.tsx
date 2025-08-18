'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Scientific pulse animation for precision indicators
interface ScientificPulseProps {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export function ScientificPulse({ children, intensity = 'medium', className }: ScientificPulseProps) {
  const intensityClasses = {
    low: 'animate-pulse-scientific opacity-80',
    medium: 'animate-pulse-scientific',
    high: 'animate-pulse-scientific opacity-90 scale-105'
  };

  return (
    <div className={cn(intensityClasses[intensity], className)}>
      {children}
    </div>
  );
}

// Shimmer effect for loading states
export function ScientificShimmer({ className }: { className?: string }) {
  return (
    <div className={cn(
      "shimmer rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
      className
    )} />
  );
}

// Glow effect for important elements
interface ScientificGlowProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

export function ScientificGlow({ 
  children, 
  color = 'primary', 
  intensity = 'medium',
  className 
}: ScientificGlowProps) {
  const glowClasses = {
    primary: {
      subtle: 'shadow-lg shadow-primary-500/20',
      medium: 'shadow-xl shadow-primary-500/30 animate-glow',
      strong: 'shadow-2xl shadow-primary-500/40 animate-glow'
    },
    secondary: {
      subtle: 'shadow-lg shadow-secondary-500/20',
      medium: 'shadow-xl shadow-secondary-500/30 animate-glow',
      strong: 'shadow-2xl shadow-secondary-500/40 animate-glow'
    },
    success: {
      subtle: 'shadow-lg shadow-success-500/20',
      medium: 'shadow-xl shadow-success-500/30 animate-glow',
      strong: 'shadow-2xl shadow-success-500/40 animate-glow'
    },
    warning: {
      subtle: 'shadow-lg shadow-warning-500/20',
      medium: 'shadow-xl shadow-warning-500/30 animate-glow',
      strong: 'shadow-2xl shadow-warning-500/40 animate-glow'
    },
    danger: {
      subtle: 'shadow-lg shadow-danger-500/20',
      medium: 'shadow-xl shadow-danger-500/30 animate-glow',
      strong: 'shadow-2xl shadow-danger-500/40 animate-glow'
    }
  };

  return (
    <div className={cn(glowClasses[color][intensity], className)}>
      {children}
    </div>
  );
}

// Scanning animation for analysis
interface ScanningAnimationProps {
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ScanningAnimation({ isActive, children, className }: ScanningAnimationProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-scan opacity-75" />
        </div>
      )}
    </div>
  );
}

// Precision analysis animation
interface PrecisionAnalysisProps {
  isAnalyzing: boolean;
  progress: number;
  className?: string;
}

export function PrecisionAnalysis({ isAnalyzing, progress, className }: PrecisionAnalysisProps) {
  return (
    <div className={cn("relative", className)}>
      {isAnalyzing && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 animate-precision" />
          <div 
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Floating particles for scientific ambiance
export function ScientificParticles({ count = 20, className }: { count?: number; className?: string }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-primary-400 rounded-full opacity-30 animate-pulse-scientific"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
    </div>
  );
}

// Scientific data visualization animation
interface DataVisualizationProps {
  data: number[];
  isAnimating: boolean;
  className?: string;
}

export function ScientificDataVisualization({ data, isAnimating, className }: DataVisualizationProps) {
  const maxValue = Math.max(...data);

  return (
    <div className={cn("flex items-end space-x-1 h-20", className)}>
      {data.map((value, index) => (
        <div
          key={index}
          className={cn(
            "bg-gradient-to-t from-primary-600 to-secondary-500 rounded-t transition-all duration-500 flex-1 min-w-[2px]",
            isAnimating && "animate-analyze"
          )}
          style={{
            height: `${(value / maxValue) * 100}%`,
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  );
}

// Scientific countdown timer
interface CountdownTimerProps {
  seconds: number;
  onComplete?: () => void;
  className?: string;
}

export function ScientificCountdown({ seconds, onComplete, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  const progress = ((seconds - timeLeft) / seconds) * 100;

  return (
    <div className={cn("text-center space-y-4", className)}>
      <div className="relative w-24 h-24 mx-auto">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="text-primary-600 transition-all duration-1000 ease-linear"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-precision">{timeLeft}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {timeLeft > 0 ? 'Analysis in progress...' : 'Analysis complete!'}
      </p>
    </div>
  );
}

// Scientific status indicator with animation
interface StatusIndicatorProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  label: string;
  className?: string;
}

export function ScientificStatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusConfig = {
    idle: {
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      animation: ''
    },
    processing: {
      color: 'text-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900',
      animation: 'animate-pulse-scientific'
    },
    success: {
      color: 'text-success-600',
      bgColor: 'bg-success-100 dark:bg-success-900',
      animation: 'animate-glow'
    },
    error: {
      color: 'text-danger-600',
      bgColor: 'bg-danger-100 dark:bg-danger-900',
      animation: 'animate-pulse'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn(
      "inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-300",
      config.bgColor,
      config.color,
      config.animation,
      className
    )}>
      <div className={cn(
        "w-2 h-2 rounded-full mr-2 rtl:ml-2 rtl:mr-0",
        config.color.replace('text-', 'bg-')
      )} />
      {label}
    </div>
  );
}

// Scientific reveal animation
interface RevealAnimationProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export function ScientificReveal({ 
  children, 
  delay = 0, 
  direction = 'up',
  className 
}: RevealAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const directionClasses = {
    up: 'animate-slide-up',
    down: 'animate-slide-down',
    left: 'animate-slide-left',
    right: 'animate-slide-right'
  };

  return (
    <div className={cn(
      "transition-all duration-500",
      isVisible ? directionClasses[direction] : 'opacity-0',
      className
    )}>
      {children}
    </div>
  );
}
