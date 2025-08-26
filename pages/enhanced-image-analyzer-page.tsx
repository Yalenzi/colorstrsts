'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { EnhancedImageAnalyzer } from '@/components/ui/enhanced-image-analyzer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SwatchIcon,
  SparklesIcon,
  BeakerIcon,
  LightBulbIcon,
  CpuChipIcon,
  EyeIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface EnhancedImageAnalyzerPageProps {
  lang: Language;
}

export function EnhancedImageAnalyzerPage({ lang }: EnhancedImageAnalyzerPageProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);
  
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'محلل الألوان المتقدم' : 'Advanced Color Analyzer',
    subtitle: isRTL ? 'تحليل ذكي للألوان من الصور باستخدام الذكاء الاصطناعي' : 'AI-powered intelligent color analysis from images',
    
    // Features
    features: isRTL ? 'المزايا' : 'Features',
    aiPowered: isRTL ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered',
    aiDescription: isRTL ? 'خوارزميات متقدمة لتحليل الألوان بدقة عالية' : 'Advanced algorithms for high-precision color analysis',
    
    colorDetection: isRTL ? 'كشف الألوان المتقدم' : 'Advanced Color Detection',
    colorDescription: isRTL ? 'استخراج الألوان المهيمنة مع معلومات مفصلة' : 'Extract dominant colors with detailed information',
    
    responsiveDesign: isRTL ? 'تصميم متجاوب' : 'Responsive Design',
    responsiveDescription: isRTL ? 'يعمل بسلاسة على جميع الأجهزة والشاشات' : 'Works seamlessly on all devices and screen sizes',
    
    realTimeAnalysis: isRTL ? 'تحليل فوري' : 'Real-time Analysis',
    realTimeDescription: isRTL ? 'نتائج سريعة ودقيقة في ثوانٍ معدودة' : 'Fast and accurate results in seconds',
    
    colorPicker: isRTL ? 'منتقي الألوان التفاعلي' : 'Interactive Color Picker',
    pickerDescription: isRTL ? 'انقر على أي نقطة في الصورة لاستخراج لونها' : 'Click anywhere on the image to extract its color',
    
    multiFormat: isRTL ? 'دعم تنسيقات متعددة' : 'Multiple Format Support',
    formatDescription: isRTL ? 'يدعم JPG, PNG, GIF, WebP وأكثر' : 'Supports JPG, PNG, GIF, WebP and more',
    
    // How it works
    howItWorks: isRTL ? 'كيف يعمل' : 'How It Works',
    step1: isRTL ? 'ارفع صورتك' : 'Upload Your Image',
    step1Description: isRTL ? 'اسحب وأفلت أو انقر لاختيار صورة من جهازك' : 'Drag and drop or click to select an image from your device',
    
    step2: isRTL ? 'التحليل التلقائي' : 'Automatic Analysis',
    step2Description: isRTL ? 'يقوم الذكاء الاصطناعي بتحليل الصورة واستخراج الألوان' : 'AI analyzes the image and extracts colors automatically',
    
    step3: isRTL ? 'استكشف النتائج' : 'Explore Results',
    step3Description: isRTL ? 'تصفح الألوان المكتشفة واحصل على معلومات مفصلة' : 'Browse detected colors and get detailed information',
    
    step4: isRTL ? 'استخدم الألوان' : 'Use Colors',
    step4Description: isRTL ? 'انسخ أكواد الألوان أو حمل لوحة الألوان' : 'Copy color codes or download color palette',
    
    // Benefits
    benefits: isRTL ? 'الفوائد' : 'Benefits',
    designProjects: isRTL ? 'مشاريع التصميم' : 'Design Projects',
    designDescription: isRTL ? 'استخرج لوحات ألوان من الصور للاستخدام في التصميم' : 'Extract color palettes from images for design use',
    
    webDevelopment: isRTL ? 'تطوير المواقع' : 'Web Development',
    webDescription: isRTL ? 'احصل على أكواد الألوان الدقيقة لمواقعك' : 'Get precise color codes for your websites',
    
    brandIdentity: isRTL ? 'الهوية التجارية' : 'Brand Identity',
    brandDescription: isRTL ? 'حلل ألوان العلامات التجارية والشعارات' : 'Analyze brand colors and logos',
    
    artAnalysis: isRTL ? 'تحليل الفن' : 'Art Analysis',
    artDescription: isRTL ? 'ادرس توزيع الألوان في الأعمال الفنية' : 'Study color distribution in artworks',
    
    // Call to action
    startAnalyzing: isRTL ? 'ابدأ التحليل' : 'Start Analyzing',
    learnMore: isRTL ? 'اعرف المزيد' : 'Learn More',
    
    // Selected color
    selectedColor: isRTL ? 'اللون المختار' : 'Selected Color',
    noColorSelected: isRTL ? 'لم يتم اختيار لون بعد' : 'No color selected yet',
  };

  const features = [
    {
      icon: SparklesIcon,
      title: texts.aiPowered,
      description: texts.aiDescription,
      color: 'text-purple-600'
    },
    {
      icon: EyeIcon,
      title: texts.colorDetection,
      description: texts.colorDescription,
      color: 'text-blue-600'
    },
    {
      icon: CpuChipIcon,
      title: texts.responsiveDesign,
      description: texts.responsiveDescription,
      color: 'text-green-600'
    },
    {
      icon: LightBulbIcon,
      title: texts.realTimeAnalysis,
      description: texts.realTimeDescription,
      color: 'text-yellow-600'
    },
    {
      icon: SwatchIcon,
      title: texts.colorPicker,
      description: texts.pickerDescription,
      color: 'text-pink-600'
    },
    {
      icon: BeakerIcon,
      title: texts.multiFormat,
      description: texts.formatDescription,
      color: 'text-indigo-600'
    }
  ];

  const steps = [
    {
      number: '1',
      title: texts.step1,
      description: texts.step1Description,
      icon: ArrowDownTrayIcon
    },
    {
      number: '2',
      title: texts.step2,
      description: texts.step2Description,
      icon: CpuChipIcon
    },
    {
      number: '3',
      title: texts.step3,
      description: texts.step3Description,
      icon: EyeIcon
    },
    {
      number: '4',
      title: texts.step4,
      description: texts.step4Description,
      icon: ShareIcon
    }
  ];

  const benefits = [
    {
      title: texts.designProjects,
      description: texts.designDescription,
      icon: SwatchIcon
    },
    {
      title: texts.webDevelopment,
      description: texts.webDescription,
      icon: CpuChipIcon
    },
    {
      title: texts.brandIdentity,
      description: texts.brandDescription,
      icon: SparklesIcon
    },
    {
      title: texts.artAnalysis,
      description: texts.artDescription,
      icon: EyeIcon
    }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <SwatchIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {texts.title}
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {texts.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
            >
              <SwatchIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {texts.startAnalyzing}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowFeatures(!showFeatures)}
              className="px-8 py-3 text-lg"
            >
              <InformationCircleIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {texts.learnMore}
            </Button>
          </div>
        </div>

        {/* Features Section */}
        {showFeatures && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {texts.features}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-800`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* How It Works */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {texts.howItWorks}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div key={index} className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                        {step.number}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {texts.benefits}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 rtl:space-x-reverse">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                          <benefit.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {benefit.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Color Display */}
        {selectedColor && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">{texts.selectedColor}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div
                className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg"
                style={{ backgroundColor: selectedColor }}
              />
              <div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {selectedColor.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Analyzer */}
        <div id="analyzer" className="scroll-mt-8">
          <EnhancedImageAnalyzer
            lang={lang}
            onColorDetected={setSelectedColor}
            standalone={true}
          />
        </div>
      </div>
    </div>
  );
}
