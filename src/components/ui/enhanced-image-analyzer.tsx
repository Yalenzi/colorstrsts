'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { aiColorAnalyzer, ColorData } from '@/lib/ai-color-analysis';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  EyeDropperIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  CpuChipIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  SwatchIcon,
  BeakerIcon,
  LightBulbIcon,
  CameraIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface DetectedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  position: { x: number; y: number };
  confidence: number;
  dominance: number;
  colorName: string;
  chemicalMatches?: string[];
}

interface AnalysisResult {
  colors: DetectedColor[];
  dominantColor: DetectedColor;
  lightingCondition: 'natural' | 'artificial' | 'mixed' | 'poor';
  imageQuality: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
  processingTime: number;
}

interface EnhancedImageAnalyzerProps {
  lang: Language;
  onColorDetected?: (color: string) => void;
  onClose?: () => void;
  testId?: string;
  standalone?: boolean;
}

export function EnhancedImageAnalyzer({ 
  lang, 
  onColorDetected, 
  onClose, 
  testId, 
  standalone = false 
}: EnhancedImageAnalyzerProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedColor, setSelectedColor] = useState<DetectedColor | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    size: number;
    format: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'محلل الألوان المتقدم' : 'Advanced Color Analyzer',
    subtitle: isRTL ? 'تحليل ذكي للألوان من الصور' : 'AI-powered color analysis from images',
    uploadImage: isRTL ? 'رفع صورة' : 'Upload Image',
    dragDrop: isRTL ? 'اسحب وأفلت الصورة هنا' : 'Drag and drop image here',
    orClick: isRTL ? 'أو انقر للاختيار' : 'or click to select',
    analyzing: isRTL ? 'جاري التحليل...' : 'Analyzing...',
    aiAnalysis: isRTL ? 'تحليل بالذكاء الاصطناعي' : 'AI Analysis',
    basicAnalysis: isRTL ? 'تحليل أساسي' : 'Basic Analysis',
    detectedColors: isRTL ? 'الألوان المكتشفة' : 'Detected Colors',
    dominantColor: isRTL ? 'اللون المهيمن' : 'Dominant Color',
    colorDetails: isRTL ? 'تفاصيل اللون' : 'Color Details',
    selectColor: isRTL ? 'اختيار اللون' : 'Select Color',
    copyHex: isRTL ? 'نسخ الكود السادس عشري' : 'Copy Hex Code',
    downloadPalette: isRTL ? 'تحميل لوحة الألوان' : 'Download Palette',
    shareResults: isRTL ? 'مشاركة النتائج' : 'Share Results',
    imageInfo: isRTL ? 'معلومات الصورة' : 'Image Info',
    lightingCondition: isRTL ? 'حالة الإضاءة' : 'Lighting Condition',
    imageQuality: isRTL ? 'جودة الصورة' : 'Image Quality',
    recommendations: isRTL ? 'التوصيات' : 'Recommendations',
    processingTime: isRTL ? 'وقت المعالجة' : 'Processing Time',
    confidence: isRTL ? 'مستوى الثقة' : 'Confidence',
    dominance: isRTL ? 'الهيمنة' : 'Dominance',
    position: isRTL ? 'الموضع' : 'Position',
    chemicalMatches: isRTL ? 'المطابقات الكيميائية' : 'Chemical Matches',
    advancedOptions: isRTL ? 'خيارات متقدمة' : 'Advanced Options',
    colorPicker: isRTL ? 'منتقي الألوان' : 'Color Picker',
    clickOnImage: isRTL ? 'انقر على الصورة لاختيار لون' : 'Click on image to pick color',
    
    // Quality levels
    excellent: isRTL ? 'ممتاز' : 'Excellent',
    good: isRTL ? 'جيد' : 'Good',
    fair: isRTL ? 'مقبول' : 'Fair',
    poor: isRTL ? 'ضعيف' : 'Poor',
    
    // Lighting conditions
    natural: isRTL ? 'طبيعية' : 'Natural',
    artificial: isRTL ? 'اصطناعية' : 'Artificial',
    mixed: isRTL ? 'مختلطة' : 'Mixed',
    poorLighting: isRTL ? 'إضاءة ضعيفة' : 'Poor Lighting',
    
    // Error messages
    errorUploading: isRTL ? 'خطأ في رفع الصورة' : 'Error uploading image',
    errorAnalyzing: isRTL ? 'خطأ في تحليل الصورة' : 'Error analyzing image',
    invalidFormat: isRTL ? 'تنسيق الصورة غير مدعوم' : 'Unsupported image format',
    fileTooLarge: isRTL ? 'حجم الملف كبير جداً' : 'File size too large',
    
    // Success messages
    colorCopied: isRTL ? 'تم نسخ كود اللون' : 'Color code copied',
    paletteDownloaded: isRTL ? 'تم تحميل لوحة الألوان' : 'Palette downloaded',
    
    // Units
    pixels: isRTL ? 'بكسل' : 'pixels',
    mb: isRTL ? 'ميجابايت' : 'MB',
    ms: isRTL ? 'مللي ثانية' : 'ms',
    percent: isRTL ? '%' : '%',
  };

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(texts.invalidFormat);
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError(texts.fileTooLarge);
      return;
    }

    setError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      setUploadedImage(imageSrc);
      setImageInfo({
        width: 0,
        height: 0,
        size: file.size,
        format: file.type
      });
      analyzeImage(imageSrc, file);
    };
    
    reader.readAsDataURL(file);
  }, [texts.invalidFormat, texts.fileTooLarge]);

  // Analyze image for colors
  const analyzeImage = useCallback(async (imageSrc: string, file: File) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);
    setAnalysisResult(null);

    try {
      const img = new Image();
      
      img.onload = async () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Update image info
          setImageInfo(prev => prev ? {
            ...prev,
            width: img.width,
            height: img.height
          } : null);

          setAnalysisProgress(20);

          // Set canvas size with max dimensions for performance
          const maxDimension = 1200;
          let { width, height } = img;
          
          if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          setAnalysisProgress(40);

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);
          
          setAnalysisProgress(60);

          // Get image data
          const imageData = ctx.getImageData(0, 0, width, height);
          
          setAnalysisProgress(80);

          let result: AnalysisResult;

          if (aiAnalysisEnabled) {
            console.log('🤖 Using AI-enhanced color analysis...');
            const aiResult = aiColorAnalyzer.analyzeImage(imageData, width, height);
            
            result = {
              colors: aiResult.colors.map(color => ({
                hex: color.hex,
                rgb: color.rgb,
                hsl: color.hsl,
                position: color.position,
                confidence: color.confidence,
                dominance: color.dominance,
                colorName: color.colorName,
                chemicalMatches: color.chemicalMatches
              })),
              dominantColor: {
                hex: aiResult.dominantColor.hex,
                rgb: aiResult.dominantColor.rgb,
                hsl: aiResult.dominantColor.hsl,
                position: aiResult.dominantColor.position,
                confidence: aiResult.dominantColor.confidence,
                dominance: aiResult.dominantColor.dominance,
                colorName: aiResult.dominantColor.colorName,
                chemicalMatches: aiResult.dominantColor.chemicalMatches
              },
              lightingCondition: aiResult.lightingCondition,
              imageQuality: aiResult.imageQuality,
              recommendations: lang === 'ar' ? aiResult.recommendations_ar : aiResult.recommendations,
              processingTime: aiResult.processingTime
            };
          } else {
            console.log('📊 Using basic color analysis...');
            result = await basicColorAnalysis(imageData, width, height);
          }

          setAnalysisResult(result);
          setAnalysisProgress(100);

        } catch (error) {
          console.error('Error during image analysis:', error);
          setError(texts.errorAnalyzing);
        } finally {
          setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisProgress(0);
          }, 500);
        }
      };

      img.onerror = () => {
        setError(texts.errorUploading);
        setIsAnalyzing(false);
      };

      img.src = imageSrc;

    } catch (error) {
      console.error('Error analyzing image:', error);
      setError(texts.errorAnalyzing);
      setIsAnalyzing(false);
    }
  }, [aiAnalysisEnabled, lang, texts.errorAnalyzing, texts.errorUploading]);

  // Basic color analysis fallback
  const basicColorAnalysis = async (imageData: ImageData, width: number, height: number): Promise<AnalysisResult> => {
    const data = imageData.data;
    const colorMap = new Map<string, { count: number; positions: { x: number; y: number }[] }>();
    const step = Math.max(1, Math.floor(Math.sqrt(width * height) / 100)); // Adaptive sampling

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];

        if (alpha > 128) {
          const hex = rgbToHex(r, g, b);
          const existing = colorMap.get(hex) || { count: 0, positions: [] };
          existing.count++;
          existing.positions.push({ x, y });
          colorMap.set(hex, existing);
        }
      }
    }

    // Get top colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8);

    const totalPixels = sortedColors.reduce((sum, [, data]) => sum + data.count, 0);

    const colors: DetectedColor[] = sortedColors.map(([hex, data]) => {
      const rgb = hexToRgb(hex)!;
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const dominance = (data.count / totalPixels) * 100;
      const avgPosition = data.positions.reduce(
        (acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }),
        { x: 0, y: 0 }
      );
      avgPosition.x /= data.positions.length;
      avgPosition.y /= data.positions.length;

      return {
        hex,
        rgb,
        hsl,
        position: { x: Math.round(avgPosition.x), y: Math.round(avgPosition.y) },
        confidence: Math.min(95, 60 + dominance),
        dominance,
        colorName: getColorName(hex),
        chemicalMatches: []
      };
    });

    return {
      colors,
      dominantColor: colors[0],
      lightingCondition: 'mixed',
      imageQuality: width * height > 500000 ? 'good' : 'fair',
      recommendations: [
        lang === 'ar' ? 'جودة الصورة مقبولة للتحليل' : 'Image quality is acceptable for analysis',
        lang === 'ar' ? 'يمكن تحسين النتائج بصورة عالية الدقة' : 'Results can be improved with higher resolution'
      ],
      processingTime: 0
    };
  };

  // Utility functions
  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const getColorName = (hex: string): string => {
    // Basic color name mapping
    const colorNames: { [key: string]: { en: string; ar: string } } = {
      '#FF0000': { en: 'Red', ar: 'أحمر' },
      '#00FF00': { en: 'Green', ar: 'أخضر' },
      '#0000FF': { en: 'Blue', ar: 'أزرق' },
      '#FFFF00': { en: 'Yellow', ar: 'أصفر' },
      '#FF00FF': { en: 'Magenta', ar: 'بنفسجي' },
      '#00FFFF': { en: 'Cyan', ar: 'سماوي' },
      '#000000': { en: 'Black', ar: 'أسود' },
      '#FFFFFF': { en: 'White', ar: 'أبيض' },
    };

    // Find closest color name (simplified)
    const rgb = hexToRgb(hex);
    if (!rgb) return lang === 'ar' ? 'غير محدد' : 'Unknown';

    // Simple color classification
    const { r, g, b } = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if (max - min < 30) {
      if (max < 50) return lang === 'ar' ? 'أسود' : 'Black';
      if (max > 200) return lang === 'ar' ? 'أبيض' : 'White';
      return lang === 'ar' ? 'رمادي' : 'Gray';
    }
    
    if (r > g && r > b) return lang === 'ar' ? 'أحمر' : 'Red';
    if (g > r && g > b) return lang === 'ar' ? 'أخضر' : 'Green';
    if (b > r && b > g) return lang === 'ar' ? 'أزرق' : 'Blue';
    
    return lang === 'ar' ? 'مختلط' : 'Mixed';
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-4 space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <SwatchIcon className="h-8 w-8 text-blue-600" />
          {texts.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {texts.subtitle}
        </p>
      </div>

      {/* Upload Area */}
      {!uploadedImage && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-colors">
          <CardContent className="p-8 md:p-12">
            <div
              className={`text-center space-y-4 ${dragActive ? 'scale-105' : ''} transition-transform`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const files = Array.from(e.dataTransfer.files);
                if (files[0]) handleFileUpload(files[0]);
              }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <PhotoIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                  {texts.dragDrop}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {texts.orClick}
                </p>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {texts.uploadImage}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />

              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>{isRTL ? 'الحد الأقصى: 10 ميجابايت' : 'Max size: 10MB'}</p>
                <p>{isRTL ? 'التنسيقات المدعومة: JPG, PNG, GIF, WebP' : 'Supported: JPG, PNG, GIF, WebP'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-red-600 dark:text-red-400">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <CpuChipIcon className="h-6 w-6 text-blue-600 animate-pulse" />
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {texts.analyzing}
                </span>
              </div>

              <Progress value={analysisProgress} className="w-full" />

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                {analysisProgress}% {isRTL ? 'مكتمل' : 'Complete'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Display and Analysis Results */}
      {uploadedImage && !isAnalyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2 rtl:space-x-reverse">
                  <CameraIcon className="h-5 w-5" />
                  {isRTL ? 'الصورة المرفوعة' : 'Uploaded Image'}
                </span>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAiAnalysisEnabled(!aiAnalysisEnabled)}
                  >
                    {aiAnalysisEnabled ? (
                      <SparklesIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    ) : (
                      <BeakerIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    )}
                    {aiAnalysisEnabled ? texts.aiAnalysis : texts.basicAnalysis}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUploadedImage(null);
                      setAnalysisResult(null);
                      setSelectedColor(null);
                      setError(null);
                    }}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative">
                <img
                  ref={imageRef}
                  src={uploadedImage}
                  alt="Uploaded"
                  className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                  onClick={(e) => {
                    if (!analysisResult) return;

                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    // Find closest color
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        const scaleX = canvas.width / rect.width;
                        const scaleY = canvas.height / rect.height;
                        const pixelData = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
                        const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);

                        // Find closest detected color
                        const closest = analysisResult.colors.reduce((prev, curr) => {
                          const prevDist = Math.abs(parseInt(prev.hex.slice(1), 16) - parseInt(hex.slice(1), 16));
                          const currDist = Math.abs(parseInt(curr.hex.slice(1), 16) - parseInt(hex.slice(1), 16));
                          return currDist < prevDist ? curr : prev;
                        });

                        setSelectedColor(closest);
                      }
                    }
                  }}
                  style={{ cursor: analysisResult ? 'crosshair' : 'default' }}
                />

                {/* Color picker overlay */}
                {analysisResult && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {texts.clickOnImage}
                  </div>
                )}
              </div>

              {/* Image Info */}
              {imageInfo && (
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'الأبعاد:' : 'Dimensions:'}</span>
                    <span className="ml-2 rtl:mr-2 font-medium">
                      {imageInfo.width} × {imageInfo.height} {texts.pixels}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'الحجم:' : 'Size:'}</span>
                    <span className="ml-2 rtl:mr-2 font-medium">
                      {(imageInfo.size / (1024 * 1024)).toFixed(2)} {texts.mb}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <EyeDropperIcon className="h-5 w-5" />
                  {texts.detectedColors}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Detected Colors Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {analysisResult.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`
                        aspect-square rounded-lg border-2 transition-all hover:scale-105
                        ${selectedColor?.hex === color.hex
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}
                      style={{ backgroundColor: color.hex }}
                      title={`${color.colorName} (${color.hex})`}
                    />
                  ))}
                </div>

                {/* Selected Color Details */}
                {selectedColor && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {texts.colorDetails}
                    </h4>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                        <div>
                          <div className="font-medium">{selectedColor.colorName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedColor.hex.toUpperCase()}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedColor.hex);
                            // Show toast notification
                          }}
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">RGB:</span>
                          <span className="ml-2 rtl:mr-2 font-mono">
                            {selectedColor.rgb.r}, {selectedColor.rgb.g}, {selectedColor.rgb.b}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">HSL:</span>
                          <span className="ml-2 rtl:mr-2 font-mono">
                            {selectedColor.hsl.h}°, {selectedColor.hsl.s}%, {selectedColor.hsl.l}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{texts.confidence}:</span>
                          <span className="ml-2 rtl:mr-2 font-medium">
                            {selectedColor.confidence.toFixed(1)}{texts.percent}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{texts.dominance}:</span>
                          <span className="ml-2 rtl:mr-2 font-medium">
                            {selectedColor.dominance.toFixed(1)}{texts.percent}
                          </span>
                        </div>
                      </div>

                      {onColorDetected && (
                        <Button
                          onClick={() => onColorDetected(selectedColor.hex)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                          {texts.selectColor}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
