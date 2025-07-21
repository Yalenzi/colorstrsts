'use client';

import { useState, useRef, useCallback } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PhotoIcon,
  EyeDropperIcon,
  BeakerIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PrinterIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  CameraIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface ImageAnalyzerPageProps {
  lang: Language;
}

interface ColorAnalysis {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
  name: string;
  chemicalMatch?: string[];
}

interface ChemicalMatch {
  substance: string;
  confidence: number;
  testMethod: string;
  colorRange: string[];
  description: string;
}

interface AnalysisResult {
  colors: ColorAnalysis[];
  chemicals: ChemicalMatch[];
  dominantColor: ColorAnalysis;
  analysisTime: number;
  imageInfo: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

export function ImageAnalyzerPage({ lang }: ImageAnalyzerPageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('colors');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isRTL = lang === 'ar';

  // Get translations
  const t = getTranslationsSync(lang) || {};

  // Color analysis functions
  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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
    const colorNames: { [key: string]: string } = {
      '#FF0000': lang === 'ar' ? 'أحمر' : 'Red',
      '#00FF00': lang === 'ar' ? 'أخضر' : 'Green',
      '#0000FF': lang === 'ar' ? 'أزرق' : 'Blue',
      '#FFFF00': lang === 'ar' ? 'أصفر' : 'Yellow',
      '#FF00FF': lang === 'ar' ? 'بنفسجي' : 'Magenta',
      '#00FFFF': lang === 'ar' ? 'سماوي' : 'Cyan',
      '#FFA500': lang === 'ar' ? 'برتقالي' : 'Orange',
      '#800080': lang === 'ar' ? 'بنفسجي' : 'Purple',
      '#FFC0CB': lang === 'ar' ? 'وردي' : 'Pink',
      '#A52A2A': lang === 'ar' ? 'بني' : 'Brown',
      '#000000': lang === 'ar' ? 'أسود' : 'Black',
      '#FFFFFF': lang === 'ar' ? 'أبيض' : 'White',
      '#808080': lang === 'ar' ? 'رمادي' : 'Gray'
    };

    // Find closest color
    let closestColor = '#000000';
    let minDistance = Infinity;

    Object.keys(colorNames).forEach(color => {
      const distance = getColorDistance(hex, color);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    });

    return colorNames[closestColor] || (lang === 'ar' ? 'غير محدد' : 'Unknown');
  };

  const getColorDistance = (color1: string, color2: string): number => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (!rgb1 || !rgb2) return Infinity;

    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        analyzeImage(e.target?.result as string, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData: string, file: File) => {
    setAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);

    try {
      const startTime = Date.now();

      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData;
      });

      // Create canvas and get image data
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      setAnalysisProgress(20);

      // Extract pixel data
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageDataObj.data;

      setAnalysisProgress(40);

      // Analyze colors
      const colorMap = new Map<string, number>();
      const step = 4; // Sample every 4th pixel for performance

      for (let i = 0; i < pixels.length; i += step * 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const alpha = pixels[i + 3];

        if (alpha > 128) { // Only consider non-transparent pixels
          const hex = rgbToHex(r, g, b);
          colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }
      }

      setAnalysisProgress(60);

      // Get top colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      const totalPixels = sortedColors.reduce((sum, [, count]) => sum + count, 0);

      const colors: ColorAnalysis[] = sortedColors.map(([hex, count]) => {
        const rgb = hexToRgb(hex)!;
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const percentage = (count / totalPixels) * 100;

        return {
          hex,
          rgb,
          hsl,
          percentage,
          name: getColorName(hex),
          chemicalMatch: getChemicalMatches(hex)
        };
      });

      setAnalysisProgress(80);

      // Identify potential chemicals
      const chemicals = identifyChemicals(colors);

      setAnalysisProgress(90);

      const analysisTime = Date.now() - startTime;

      const result: AnalysisResult = {
        colors,
        chemicals,
        dominantColor: colors[0],
        analysisTime,
        imageInfo: {
          width: img.width,
          height: img.height,
          size: file.size,
          format: file.type
        }
      };

      setAnalysisResult(result);
      setAnalysisProgress(100);

    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setTimeout(() => {
        setAnalyzing(false);
        setAnalysisProgress(0);
      }, 500);
    }
  };

  const getChemicalMatches = (hex: string): string[] => {
    const chemicalDatabase: { [key: string]: string[] } = {
      '#FF0000': ['Iron Oxide', 'Hemoglobin', 'Red Dye'],
      '#00FF00': ['Copper Carbonate', 'Chlorophyll', 'Green Dye'],
      '#0000FF': ['Copper Sulfate', 'Methylene Blue', 'Blue Dye'],
      '#FFFF00': ['Sulfur', 'Yellow Dye', 'Turmeric'],
      '#FF00FF': ['Potassium Permanganate', 'Purple Dye'],
      '#00FFFF': ['Copper Compounds', 'Cyan Dye'],
      '#FFA500': ['Orange Dye', 'Beta Carotene'],
      '#800080': ['Iodine', 'Purple Compounds'],
      '#000000': ['Carbon', 'Iron Oxide', 'Charcoal'],
      '#FFFFFF': ['Titanium Dioxide', 'Calcium Carbonate']
    };

    return chemicalDatabase[hex] || [];
  };

  const identifyChemicals = (colors: ColorAnalysis[]): ChemicalMatch[] => {
    const chemicals: ChemicalMatch[] = [];

    colors.forEach(color => {
      if (color.chemicalMatch && color.chemicalMatch.length > 0) {
        color.chemicalMatch.forEach(substance => {
          const confidence = Math.min(95, Math.max(60, color.percentage * 2));

          chemicals.push({
            substance,
            confidence,
            testMethod: getTestMethod(substance),
            colorRange: [color.hex],
            description: getChemicalDescription(substance)
          });
        });
      }
    });

    return chemicals.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  };

  const getTestMethod = (substance: string): string => {
    const testMethods: { [key: string]: string } = {
      'Iron Oxide': 'Ferric Sulfate Test',
      'Copper Sulfate': 'Copper Test',
      'Methylene Blue': 'Blue Dye Test',
      'Potassium Permanganate': 'Permanganate Test',
      'Sulfur': 'Sulfur Test',
      'Iodine': 'Iodine Test'
    };

    return testMethods[substance] || (lang === 'ar' ? 'اختبار عام' : 'General Test');
  };

  const getChemicalDescription = (substance: string): string => {
    const descriptions: { [key: string]: string } = {
      'Iron Oxide': lang === 'ar' ? 'أكسيد الحديد - مركب شائع في الصدأ والأصباغ' : 'Iron Oxide - Common in rust and pigments',
      'Copper Sulfate': lang === 'ar' ? 'كبريتات النحاس - مركب أزرق يستخدم في الزراعة' : 'Copper Sulfate - Blue compound used in agriculture',
      'Methylene Blue': lang === 'ar' ? 'الميثيلين الأزرق - صبغة طبية وكيميائية' : 'Methylene Blue - Medical and chemical dye',
      'Sulfur': lang === 'ar' ? 'الكبريت - عنصر كيميائي أصفر' : 'Sulfur - Yellow chemical element',
      'Iodine': lang === 'ar' ? 'اليود - عنصر كيميائي بنفسجي' : 'Iodine - Purple chemical element'
    };

    return descriptions[substance] || (lang === 'ar' ? 'مادة كيميائية' : 'Chemical substance');
  };

  const downloadResults = () => {
    if (!analysisResult) return;

    const data = {
      timestamp: new Date().toISOString(),
      imageInfo: analysisResult.imageInfo,
      colors: analysisResult.colors,
      chemicals: analysisResult.chemicals,
      analysisTime: analysisResult.analysisTime
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printResults = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {lang === 'ar' ? 'محلل الصور المتقدم' : 'Advanced Image Analyzer'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {lang === 'ar'
                ? 'تحليل متقدم للصور لاستخراج الألوان وتحديد المواد الكيميائية بدقة عالية'
                : 'Advanced image analysis for color extraction and precise chemical substance identification'
              }
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="flex items-center">
                <EyeDropperIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                {lang === 'ar' ? 'استخراج الألوان' : 'Color Extraction'}
              </Badge>
              <Badge variant="secondary" className="flex items-center">
                <BeakerIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                {lang === 'ar' ? 'تحديد المواد' : 'Chemical ID'}
              </Badge>
              <Badge variant="secondary" className="flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                {lang === 'ar' ? 'تحليل إحصائي' : 'Statistical Analysis'}
              </Badge>
            </div>
          </div>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PhotoIcon className="h-6 w-6 mr-2 rtl:ml-2 rtl:mr-0" />
                {lang === 'ar' ? 'رفع الصورة' : 'Upload Image'}
              </CardTitle>
              <CardDescription>
                {lang === 'ar' 
                  ? 'اختر صورة من جهازك لتحليل الألوان'
                  : 'Select an image from your device to analyze colors'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                {selectedImage ? (
                  <div className="space-y-4">
                    <img 
                      src={selectedImage} 
                      alt="Selected" 
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {lang === 'ar' ? 'اختيار صورة أخرى' : 'Choose Another Image'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <PhotoIcon className="h-16 w-16 mx-auto text-gray-400" />
                    <div>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        <ArrowUpTrayIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {lang === 'ar' ? 'اختيار صورة' : 'Choose Image'}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      {lang === 'ar' 
                        ? 'PNG, JPG, GIF حتى 10MB'
                        : 'PNG, JPG, GIF up to 10MB'
                      }
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Progress */}
          {analyzing && (
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-lg font-medium mb-2">
                    {lang === 'ar' ? 'جاري تحليل الصورة...' : 'Analyzing image...'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {lang === 'ar' ? 'استخراج الألوان وتحديد المواد الكيميائية' : 'Extracting colors and identifying chemical substances'}
                  </p>
                </div>
                <Progress value={analysisProgress} className="w-full" />
                <p className="text-center text-sm text-gray-500 mt-2">
                  {analysisProgress}%
                </p>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysisResult && !analyzing && (
            <div className="space-y-6">
              {/* Results Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <MagnifyingGlassIcon className="h-6 w-6 mr-2 rtl:ml-2 rtl:mr-0" />
                      {lang === 'ar' ? 'نتائج التحليل' : 'Analysis Results'}
                    </CardTitle>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button variant="outline" size="sm" onClick={downloadResults}>
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                        {lang === 'ar' ? 'تحميل' : 'Download'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={printResults}>
                        <PrinterIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                        {lang === 'ar' ? 'طباعة' : 'Print'}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {lang === 'ar'
                      ? `تم تحليل ${analysisResult.colors.length} لون في ${analysisResult.analysisTime}ms`
                      : `Analyzed ${analysisResult.colors.length} colors in ${analysisResult.analysisTime}ms`
                    }
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Tabs for different views */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="colors">
                    <EyeDropperIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    {lang === 'ar' ? 'الألوان' : 'Colors'}
                  </TabsTrigger>
                  <TabsTrigger value="chemicals">
                    <BeakerIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    {lang === 'ar' ? 'المواد الكيميائية' : 'Chemicals'}
                  </TabsTrigger>
                  <TabsTrigger value="stats">
                    <ChartBarIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    {lang === 'ar' ? 'الإحصائيات' : 'Statistics'}
                  </TabsTrigger>
                </TabsList>

                {/* Colors Tab */}
                <TabsContent value="colors">
                  <Card>
                    <CardHeader>
                      <CardTitle>{lang === 'ar' ? 'الألوان المستخرجة' : 'Extracted Colors'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analysisResult.colors.map((color, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                              <div
                                className="w-12 h-12 rounded-lg border-2 border-gray-300"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div>
                                <p className="font-medium">{color.name}</p>
                                <p className="text-sm text-gray-500">{color.hex}</p>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">RGB:</span> {color.rgb.r}, {color.rgb.g}, {color.rgb.b}</p>
                              <p><span className="font-medium">HSL:</span> {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%</p>
                              <p><span className="font-medium">{lang === 'ar' ? 'النسبة:' : 'Percentage:'}</span> {color.percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Chemicals Tab */}
                <TabsContent value="chemicals">
                  <Card>
                    <CardHeader>
                      <CardTitle>{lang === 'ar' ? 'المواد الكيميائية المحتملة' : 'Potential Chemical Substances'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysisResult.chemicals.length > 0 ? (
                        <div className="space-y-4">
                          {analysisResult.chemicals.map((chemical, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-lg">{chemical.substance}</h3>
                                <Badge variant={chemical.confidence > 80 ? 'default' : chemical.confidence > 60 ? 'secondary' : 'outline'}>
                                  {chemical.confidence.toFixed(0)}% {lang === 'ar' ? 'ثقة' : 'confidence'}
                                </Badge>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-2">{chemical.description}</p>
                              <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
                                <span><strong>{lang === 'ar' ? 'طريقة الاختبار:' : 'Test Method:'}</strong> {chemical.testMethod}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-8">
                          {lang === 'ar' ? 'لم يتم العثور على مواد كيميائية محددة' : 'No specific chemical substances identified'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="stats">
                  <Card>
                    <CardHeader>
                      <CardTitle>{lang === 'ar' ? 'إحصائيات التحليل' : 'Analysis Statistics'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-3">{lang === 'ar' ? 'معلومات الصورة' : 'Image Information'}</h3>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">{lang === 'ar' ? 'الأبعاد:' : 'Dimensions:'}</span> {analysisResult.imageInfo.width} × {analysisResult.imageInfo.height}</p>
                            <p><span className="font-medium">{lang === 'ar' ? 'الحجم:' : 'Size:'}</span> {(analysisResult.imageInfo.size / 1024).toFixed(1)} KB</p>
                            <p><span className="font-medium">{lang === 'ar' ? 'النوع:' : 'Format:'}</span> {analysisResult.imageInfo.format}</p>
                            <p><span className="font-medium">{lang === 'ar' ? 'وقت التحليل:' : 'Analysis Time:'}</span> {analysisResult.analysisTime}ms</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium mb-3">{lang === 'ar' ? 'اللون المهيمن' : 'Dominant Color'}</h3>
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div
                              className="w-16 h-16 rounded-lg border-2 border-gray-300"
                              style={{ backgroundColor: analysisResult.dominantColor.hex }}
                            />
                            <div>
                              <p className="font-medium">{analysisResult.dominantColor.name}</p>
                              <p className="text-sm text-gray-500">{analysisResult.dominantColor.hex}</p>
                              <p className="text-sm text-gray-500">{analysisResult.dominantColor.percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
}
