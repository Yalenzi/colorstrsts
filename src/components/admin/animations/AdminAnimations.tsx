'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';

// Loading Spinner Component
export function AdminLoadingSpinner({ 
  size = 'medium', 
  color = 'blue',
  className = '' 
}: {
  size?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'green' | 'purple' | 'gray';
  className?: string;
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    purple: 'border-purple-600',
    gray: 'border-gray-600'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className={`
        w-full h-full border-2 border-transparent border-t-current rounded-full animate-spin
        ${colorClasses[color]}
      `} />
    </div>
  );
}

// Skeleton Loading Component
export function AdminSkeleton({ 
  className = '',
  lines = 1,
  height = 'h-4'
}: {
  className?: string;
  lines?: number;
  height?: string;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index}
          className={`bg-gray-200 dark:bg-gray-700 rounded ${height} ${
            index < lines - 1 ? 'mb-2' : ''
          }`}
        />
      ))}
    </div>
  );
}

// Fade In Animation Component
export function AdminFadeIn({ 
  children, 
  delay = 0,
  duration = 300,
  className = '' 
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        transition-all ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${className}
      `}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

// Slide In Animation Component
export function AdminSlideIn({ 
  children, 
  direction = 'left',
  delay = 0,
  duration = 300,
  className = '' 
}: {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (isVisible) return 'translate-x-0 translate-y-0';
    
    switch (direction) {
      case 'left': return '-translate-x-8';
      case 'right': return 'translate-x-8';
      case 'up': return '-translate-y-8';
      case 'down': return 'translate-y-8';
      default: return '-translate-x-8';
    }
  };

  return (
    <div 
      className={`
        transition-all ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${getTransform()}
        ${className}
      `}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

// Scale Animation Component
export function AdminScaleIn({ 
  children, 
  delay = 0,
  duration = 300,
  className = '' 
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        transition-all ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        ${className}
      `}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

// Stagger Animation Container
export function AdminStaggerContainer({ 
  children, 
  staggerDelay = 100,
  className = '' 
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <AdminFadeIn delay={index * staggerDelay}>
          {child}
        </AdminFadeIn>
      ))}
    </div>
  );
}

// Pulse Animation Component
export function AdminPulse({ 
  children, 
  className = '',
  intensity = 'normal'
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'normal' | 'strong';
}) {
  const intensityClasses = {
    subtle: 'animate-pulse',
    normal: 'animate-pulse',
    strong: 'animate-bounce'
  };

  return (
    <div className={`${intensityClasses[intensity]} ${className}`}>
      {children}
    </div>
  );
}

// Hover Scale Component
export function AdminHoverScale({ 
  children, 
  scale = 'small',
  className = '' 
}: {
  children: React.ReactNode;
  scale?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  const scaleClasses = {
    small: 'hover:scale-105',
    medium: 'hover:scale-110',
    large: 'hover:scale-125'
  };

  return (
    <div className={`transition-transform duration-200 ease-out ${scaleClasses[scale]} ${className}`}>
      {children}
    </div>
  );
}

// Progress Bar Component
export function AdminProgressBar({ 
  progress, 
  color = 'blue',
  size = 'medium',
  animated = true,
  showLabel = false,
  className = '' 
}: {
  progress: number;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`
            ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out
            ${colorClasses[color]}
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// Typing Animation Component
export function AdminTypingAnimation({ 
  text, 
  speed = 50,
  className = '',
  onComplete 
}: {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// Count Up Animation Component
export function AdminCountUp({ 
  end, 
  start = 0,
  duration = 2000,
  className = '',
  prefix = '',
  suffix = ''
}: {
  end: number;
  start?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const increment = (end - start) / (duration / 16);
    const timer = setInterval(() => {
      setCount(prev => {
        const next = prev + increment;
        if (next >= end) {
          clearInterval(timer);
          return end;
        }
        return next;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [end, start, duration]);

  return (
    <span className={className}>
      {prefix}{Math.floor(count).toLocaleString()}{suffix}
    </span>
  );
}

// Floating Action Button
export function AdminFloatingButton({ 
  children, 
  onClick,
  position = 'bottom-right',
  color = 'blue',
  size = 'medium',
  className = '' 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: 'blue' | 'green' | 'purple' | 'red';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    red: 'bg-red-600 hover:bg-red-700'
  };

  return (
    <button
      onClick={onClick}
      className={`
        fixed ${positionClasses[position]} ${sizeClasses[size]} ${colorClasses[color]}
        rounded-full shadow-lg hover:shadow-xl transform hover:scale-110
        transition-all duration-200 ease-out flex items-center justify-center
        text-white z-50 ${className}
      `}
    >
      {children}
    </button>
  );
}

// Ripple Effect Component
export function AdminRipple({ 
  children, 
  className = '',
  color = 'rgba(255, 255, 255, 0.3)'
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: color,
            pointerEvents: 'none'
          }}
        />
      ))}
    </div>
  );
}
