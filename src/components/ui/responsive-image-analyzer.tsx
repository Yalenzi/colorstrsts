'use client';

import { useState, useRef, useCallback } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  EyeDropperIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  SwatchIcon,
  CameraIcon,
  DocumentDuplicateIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface DetectedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  name: string;
  dominance: number;
  position: { x: number; y: number };
}

interface ResponsiveImageAnalyzerProps {
  lang: Language;
  onColorDetected?: (color: string) => void;
  onClose?: () => void;
}

export function ResponsiveImageAnalyzer({ 
  lang, 
  onColorDetected, 
  onClose 
}: ResponsiveImageAnalyzerProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedColors, setDetectedColors] = useState<DetectedColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<DetectedColor | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'محلل الألوان' : 'Color Analyzer',
    subtitle: isRTL ? 'استخرج الألوان من الصور' : 'Extract colors from images',
    uploadImage: isRTL ? 'رفع صورة' : 'Upload Image',
    dragDrop: isRTL ? 'اسحب وأفلت الصورة هنا' : 'Drag and drop image here',
    orClick: isRTL ? 'أو انقر للاختيار' : 'or click to select',
    analyzing: isRTL ? 'جاري التحليل...' : 'Analyzing...',
    detectedColors: isRTL ? 'الألوان المكتشفة' : 'Detected Colors',
    selectColor: isRTL ? 'اختيار اللون' : 'Select Color',
    copyHex: isRTL ? 'نسخ الكود' : 'Copy Code',
    clickOnImage: isRTL ? 'انقر على الصورة لاختيار لون' : 'Click on image to pick color',
    dominance: isRTL ? 'الهيمنة' : 'Dominance',
    position: isRTL ? 'الموضع' : 'Position',
    
    // Error messages
    errorUploading: isRTL ? 'خطأ في رفع الصورة' : 'Error uploading image',
    invalidFormat: isRTL ? 'تنسيق الصورة غير مدعوم' : 'Unsupported image format',
    fileTooLarge: isRTL ? 'حجم الملف كبير جداً (الحد الأقصى 5MB)' : 'File too large (max 5MB)',
    
    // Success messages
    colorCopied: isRTL ? 'تم نسخ كود اللون' : 'Color code copied',
    
    // Color names
    red: isRTL ? 'أحمر' : 'Red',
    green: isRTL ? 'أخضر' : 'Green',
    blue: isRTL ? 'أزرق' : 'Blue',
    yellow: isRTL ? 'أصفر' : 'Yellow',
    orange: isRTL ? 'برتقالي' : 'Orange',
    purple: isRTL ? 'بنفسجي' : 'Purple',
    pink: isRTL ? 'وردي' : 'Pink',
    brown: isRTL ? 'بني' : 'Brown',
    black: isRTL ? 'أسود' : 'Black',
    white: isRTL ? 'أبيض' : 'White',
    gray: isRTL ? 'رمادي' : 'Gray',
    unknown: isRTL ? 'غير محدد' : 'Unknown',
  };

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(texts.invalidFormat);
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError(texts.fileTooLarge);
      return;
    }

    setError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      setUploadedImage(imageSrc);
      analyzeImage(imageSrc);
    };
    
    reader.readAsDataURL(file);
  }, [texts.invalidFormat, texts.fileTooLarge]);

  // Analyze image for colors
  const analyzeImage = useCallback(async (imageSrc: string) => {
    setIsAnalyzing(true);
    setError(null);
    setDetectedColors([]);
    setSelectedColor(null);

    try {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Set canvas size with max dimensions for performance
          const maxDimension = 800;
          let { width, height } = img;
          
          if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, width, height);
          
          // Extract colors
          const colors = extractColors(imageData, width, height);
          setDetectedColors(colors);

        } catch (error) {
          console.error('Error during image analysis:', error);
          setError(texts.errorUploading);
        } finally {
          setIsAnalyzing(false);
        }
      };

      img.onerror = () => {
        setError(texts.errorUploading);
        setIsAnalyzing(false);
      };

      img.src = imageSrc;

    } catch (error) {
      console.error('Error analyzing image:', error);
      setError(texts.errorUploading);
      setIsAnalyzing(false);
    }
  }, [texts.errorUploading]);

  // Extract colors from image data
  const extractColors = (imageData: ImageData, width: number, height: number): DetectedColor[] => {
    const data = imageData.data;
    const colorMap = new Map<string, { count: number; positions: { x: number; y: number }[] }>();
    const step = Math.max(1, Math.floor(Math.sqrt(width * height) / 100));

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
      .slice(0, 12);

    const totalPixels = sortedColors.reduce((sum, [, data]) => sum + data.count, 0);

    return sortedColors.map(([hex, data]) => {
      const rgb = hexToRgb(hex)!;
      const dominance = (data.count / totalPixels) * 100;
      const avgPosition = data.positions.reduce(
        (acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }),
        { x: 0, y: 0 }
      );
      avgPosition.x = Math.round(avgPosition.x / data.positions.length);
      avgPosition.y = Math.round(avgPosition.y / data.positions.length);

      return {
        hex,
        rgb,
        name: getColorName(hex),
        dominance,
        position: avgPosition
      };
    });
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

  const getColorName = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return texts.unknown;

    const { r, g, b } = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    // Simple color classification
    if (max - min < 30) {
      if (max < 50) return texts.black;
      if (max > 200) return texts.white;
      return texts.gray;
    }
    
    if (r > g && r > b) {
      if (g > 100) return texts.orange;
      return texts.red;
    }
    if (g > r && g > b) return texts.green;
    if (b > r && b > g) return texts.blue;
    if (r > 150 && g > 150 && b < 100) return texts.yellow;
    if (r > 150 && b > 150) return texts.purple;
    if (r > 150 && g > 100 && b > 100) return texts.pink;
    if (r < 150 && g < 100 && b < 100) return texts.brown;
    
    return texts.unknown;
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!detectedColors.length) return;
    
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
        const closest = detectedColors.reduce((prev, curr) => {
          const prevDist = Math.abs(parseInt(prev.hex.slice(1), 16) - parseInt(hex.slice(1), 16));
          const currDist = Math.abs(parseInt(curr.hex.slice(1), 16) - parseInt(hex.slice(1), 16));
          return currDist < prevDist ? curr : prev;
        });
        
        setSelectedColor(closest);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You can add a toast notification here
      console.log('Color copied:', text);
    });
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <SwatchIcon className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
          {texts.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {texts.subtitle}
        </p>
      </div>

      {/* Upload Area */}
      {!uploadedImage && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-colors">
          <CardContent className="p-6 md:p-8">
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
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <PhotoIcon className="h-6 w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {texts.dragDrop}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {texts.orClick}
                </p>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
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

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isRTL ? 'الحد الأقصى: 5 ميجابايت' : 'Max size: 5MB'}
              </p>
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
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <SparklesIcon className="h-6 w-6 text-blue-600 animate-pulse" />
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                {texts.analyzing}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Display and Results */}
      {uploadedImage && !isAnalyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2 rtl:space-x-reverse">
                  <CameraIcon className="h-5 w-5" />
                  {isRTL ? 'الصورة' : 'Image'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUploadedImage(null);
                    setDetectedColors([]);
                    setSelectedColor(null);
                    setError(null);
                  }}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative">
                <img
                  ref={imageRef}
                  src={uploadedImage}
                  alt="Uploaded"
                  className="w-full h-auto max-h-80 object-contain rounded-lg border border-gray-200 dark:border-gray-700 cursor-crosshair"
                  onClick={handleImageClick}
                />
                
                {detectedColors.length > 0 && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {texts.clickOnImage}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Colors Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <EyeDropperIcon className="h-5 w-5" />
                {texts.detectedColors}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Colors Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {detectedColors.map((color, index) => (
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
                    title={`${color.name} (${color.hex})`}
                  />
                ))}
              </div>

              {/* Selected Color Details */}
              {selectedColor && (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div
                      className="w-12 h-12 rounded-lg border border-gray-300"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedColor.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedColor.hex.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">
                        RGB({selectedColor.rgb.r}, {selectedColor.rgb.g}, {selectedColor.rgb.b})
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedColor.hex)}
                      >
                        <DocumentDuplicateIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                        {texts.copyHex}
                      </Button>
                      {onColorDetected && (
                        <Button
                          size="sm"
                          onClick={() => onColorDetected(selectedColor.hex)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                          {texts.selectColor}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span>{texts.dominance}: {selectedColor.dominance.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
