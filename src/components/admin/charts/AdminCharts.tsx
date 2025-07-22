'use client';

import React, { useMemo } from 'react';
import { Language } from '@/types';
import { AdminCard } from '../layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ChartData {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

interface AdminChartsProps {
  lang?: Language;
}

// Pie Chart Component
export function AdminPieChart({ 
  data, 
  title, 
  description,
  lang = 'en',
  className = '',
  showLegend = true,
  size = 'medium'
}: {
  data: ChartData[];
  title?: string;
  description?: string;
  lang?: Language;
  className?: string;
  showLegend?: boolean;
  size?: 'small' | 'medium' | 'large';
}) {
  const isRTL = lang === 'ar';
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  };

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  const chartData = useMemo(() => {
    let cumulativePercentage = 0;
    return data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const startAngle = (cumulativePercentage / 100) * 360;
      const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
      cumulativePercentage += percentage;
      
      return {
        ...item,
        percentage,
        startAngle,
        endAngle,
        color: item.color || colors[index % colors.length]
      };
    });
  }, [data, total]);

  const createPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <AdminCard 
      title={title} 
      description={description}
      className={className}
    >
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Chart */}
        <div className="relative">
          <svg className={sizeClasses[size]} viewBox="0 0 200 200">
            {chartData.map((item, index) => (
              <path
                key={index}
                d={createPath(100, 100, 80, item.startAngle, item.endAngle)}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
                title={`${item.label}: ${item.value} (${item.percentage.toFixed(1)}%)`}
              />
            ))}
            {/* Center circle for donut effect */}
            <circle cx="100" cy="100" r="40" fill="white" />
            <text x="100" y="95" textAnchor="middle" className="text-sm font-semibold fill-gray-700">
              {isRTL ? 'المجموع' : 'Total'}
            </text>
            <text x="100" y="110" textAnchor="middle" className="text-lg font-bold fill-gray-900">
              {total}
            </text>
          </svg>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex-1 space-y-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{item.value}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminCard>
  );
}

// Bar Chart Component
export function AdminBarChart({ 
  data, 
  title, 
  description,
  lang = 'en',
  className = '',
  orientation = 'vertical',
  showValues = true
}: {
  data: ChartData[];
  title?: string;
  description?: string;
  lang?: Language;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  showValues?: boolean;
}) {
  const isRTL = lang === 'ar';
  const maxValue = Math.max(...data.map(item => item.value));
  
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  return (
    <AdminCard 
      title={title} 
      description={description}
      className={className}
    >
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const color = item.color || colors[index % colors.length];
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                {showValues && (
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {item.value}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: color 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}

// Line Chart Component (Simple)
export function AdminLineChart({ 
  data, 
  title, 
  description,
  lang = 'en',
  className = '',
  showDots = true,
  trend = 'neutral'
}: {
  data: TimeSeriesData[];
  title?: string;
  description?: string;
  lang?: Language;
  className?: string;
  showDots?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const isRTL = lang === 'ar';
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue;

  const trendIcons = {
    up: <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />,
    down: <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />,
    neutral: <ChartBarIcon className="h-5 w-5 text-gray-600" />
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const createPath = () => {
    const width = 400;
    const height = 200;
    const padding = 20;
    
    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((item.value - minValue) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <AdminCard 
      title={title} 
      description={description}
      className={className}
      actions={
        <div className="flex items-center gap-2">
          {trendIcons[trend]}
          <Button variant="ghost" size="sm">
            <EyeIcon className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Chart */}
        <div className="relative">
          <svg width="100%" height="200" viewBox="0 0 400 200" className="overflow-visible">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Line */}
            <path
              d={createPath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
            
            {/* Dots */}
            {showDots && data.map((item, index) => {
              const x = 20 + (index / (data.length - 1)) * 360;
              const y = 180 - ((item.value - minValue) / range) * 160;
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                  className="hover:r-6 transition-all cursor-pointer"
                  title={`${item.label || item.date}: ${item.value}`}
                />
              );
            })}
          </svg>
        </div>

        {/* Data points */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {data.map((item, index) => (
            <div key={index} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminCard>
  );
}

// Stats Overview Component
export function AdminStatsOverview({ 
  stats, 
  title, 
  lang = 'en',
  className = '' 
}: {
  stats: Array<{
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: React.ReactNode;
  }>;
  title?: string;
  lang?: Language;
  className?: string;
}) {
  const isRTL = lang === 'ar';

  return (
    <AdminCard 
      title={title}
      className={className}
      actions={
        <Button variant="ghost" size="sm">
          <ArrowPathIcon className="h-4 w-4" />
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="text-center space-y-2">
            {stat.icon && (
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                {stat.icon}
              </div>
            )}
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
              {stat.change && (
                <div className={`text-xs font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {stat.change}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
