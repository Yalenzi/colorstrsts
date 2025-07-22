/**
 * AI-Enhanced Color Analysis Library
 * Advanced color extraction and chemical identification using machine learning techniques
 */

export interface ColorData {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  lab: { l: number; a: number; b: number };
  position: { x: number; y: number };
  confidence: number;
  dominance: number;
  colorName: string;
  chemicalMatches: ChemicalMatch[];
}

export interface ChemicalMatch {
  substance: string;
  substance_ar: string;
  confidence: number;
  testType: string;
  colorRange: string;
  notes: string;
  notes_ar: string;
}

export interface AnalysisResult {
  colors: ColorData[];
  dominantColor: ColorData;
  colorDistribution: { [key: string]: number };
  lightingCondition: 'bright' | 'normal' | 'dim' | 'mixed';
  imageQuality: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
  recommendations_ar: string[];
  processingTime: number;
}

// Enhanced color extraction with AI-like clustering
export class AIColorAnalyzer {
  private colorDatabase: ChemicalMatch[] = [
    {
      substance: 'MDMA/Ecstasy',
      substance_ar: 'إم دي إم إيه / إكستاسي',
      confidence: 0.85,
      testType: 'Marquis Test',
      colorRange: 'Purple to Black',
      notes: 'Strong purple to black reaction indicates MDMA presence',
      notes_ar: 'تفاعل بنفسجي إلى أسود قوي يشير إلى وجود إم دي إم إيه'
    },
    {
      substance: 'Cocaine',
      substance_ar: 'كوكايين',
      confidence: 0.80,
      testType: 'Scott Test',
      colorRange: 'Blue',
      notes: 'Bright blue color indicates cocaine presence',
      notes_ar: 'اللون الأزرق الساطع يشير إلى وجود الكوكايين'
    },
    {
      substance: 'Heroin',
      substance_ar: 'هيروين',
      confidence: 0.75,
      testType: 'Marquis Test',
      colorRange: 'Brown to Orange',
      notes: 'Brown to orange reaction suggests heroin',
      notes_ar: 'التفاعل البني إلى البرتقالي يشير إلى الهيروين'
    },
    {
      substance: 'LSD',
      substance_ar: 'إل إس دي',
      confidence: 0.90,
      testType: 'Ehrlich Test',
      colorRange: 'Purple to Pink',
      notes: 'Purple to pink color indicates LSD presence',
      notes_ar: 'اللون البنفسجي إلى الوردي يشير إلى وجود إل إس دي'
    },
    {
      substance: 'Methamphetamine',
      substance_ar: 'ميثامفيتامين',
      confidence: 0.82,
      testType: 'Marquis Test',
      colorRange: 'Orange to Red',
      notes: 'Orange to red reaction indicates methamphetamine',
      notes_ar: 'التفاعل البرتقالي إلى الأحمر يشير إلى الميثامفيتامين'
    },
    {
      substance: 'Cannabis/THC',
      substance_ar: 'حشيش / تي إتش سي',
      confidence: 0.70,
      testType: 'Duquenois-Levine Test',
      colorRange: 'Purple',
      notes: 'Purple color indicates cannabis presence',
      notes_ar: 'اللون البنفسجي يشير إلى وجود الحشيش'
    }
  ];

  // Convert RGB to LAB color space for better color comparison
  private rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
    // Normalize RGB values
    r = r / 255;
    g = g / 255;
    b = b / 255;

    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Convert to XYZ
    let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    let y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    let z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

    // Normalize for D65 illuminant
    x = x / 0.95047;
    y = y / 1.00000;
    z = z / 1.08883;

    // Convert to LAB
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);

    const l = (116 * y) - 16;
    const a = 500 * (x - y);
    const bValue = 200 * (y - z);

    return { l, a: a, b: bValue };
  }

  // Calculate color difference using Delta E CIE76
  private calculateColorDifference(lab1: { l: number; a: number; b: number }, lab2: { l: number; a: number; b: number }): number {
    const deltaL = lab1.l - lab2.l;
    const deltaA = lab1.a - lab2.a;
    const deltaB = lab1.b - lab2.b;
    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
  }

  // Enhanced color clustering using k-means-like algorithm
  private clusterColors(pixels: { r: number; g: number; b: number; x: number; y: number }[], k: number = 8): ColorData[] {
    if (pixels.length === 0) return [];

    // Initialize centroids randomly
    const centroids: { r: number; g: number; b: number }[] = [];
    for (let i = 0; i < k; i++) {
      const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
      centroids.push({ r: randomPixel.r, g: randomPixel.g, b: randomPixel.b });
    }

    let iterations = 0;
    const maxIterations = 20;
    let converged = false;

    while (!converged && iterations < maxIterations) {
      // Assign pixels to nearest centroid
      const clusters: { [key: number]: typeof pixels } = {};
      for (let i = 0; i < k; i++) {
        clusters[i] = [];
      }

      pixels.forEach(pixel => {
        let minDistance = Infinity;
        let closestCentroid = 0;

        centroids.forEach((centroid, index) => {
          const distance = Math.sqrt(
            Math.pow(pixel.r - centroid.r, 2) +
            Math.pow(pixel.g - centroid.g, 2) +
            Math.pow(pixel.b - centroid.b, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestCentroid = index;
          }
        });

        clusters[closestCentroid].push(pixel);
      });

      // Update centroids
      const newCentroids: { r: number; g: number; b: number }[] = [];
      let totalMovement = 0;

      for (let i = 0; i < k; i++) {
        if (clusters[i].length > 0) {
          const avgR = clusters[i].reduce((sum, p) => sum + p.r, 0) / clusters[i].length;
          const avgG = clusters[i].reduce((sum, p) => sum + p.g, 0) / clusters[i].length;
          const avgB = clusters[i].reduce((sum, p) => sum + p.b, 0) / clusters[i].length;
          
          const newCentroid = { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) };
          newCentroids.push(newCentroid);

          // Calculate movement
          const movement = Math.sqrt(
            Math.pow(newCentroid.r - centroids[i].r, 2) +
            Math.pow(newCentroid.g - centroids[i].g, 2) +
            Math.pow(newCentroid.b - centroids[i].b, 2)
          );
          totalMovement += movement;
        } else {
          newCentroids.push(centroids[i]);
        }
      }

      // Check for convergence
      converged = totalMovement < 5; // Threshold for convergence
      centroids.splice(0, centroids.length, ...newCentroids);
      iterations++;
    }

    // Convert clusters to ColorData
    const colors: ColorData[] = [];
    for (let i = 0; i < k; i++) {
      if (clusters[i] && clusters[i].length > 0) {
        const cluster = clusters[i];
        const centroid = centroids[i];
        
        // Calculate average position
        const avgX = cluster.reduce((sum, p) => sum + p.x, 0) / cluster.length;
        const avgY = cluster.reduce((sum, p) => sum + p.y, 0) / cluster.length;

        // Calculate dominance (percentage of pixels)
        const dominance = (cluster.length / pixels.length) * 100;

        // Skip very small clusters
        if (dominance < 1) continue;

        const hex = this.rgbToHex(centroid.r, centroid.g, centroid.b);
        const hsl = this.rgbToHsl(centroid.r, centroid.g, centroid.b);
        const lab = this.rgbToLab(centroid.r, centroid.g, centroid.b);

        colors.push({
          hex,
          rgb: centroid,
          hsl,
          lab,
          position: { x: Math.round(avgX), y: Math.round(avgY) },
          confidence: Math.min(95, 60 + dominance * 2), // Higher confidence for more dominant colors
          dominance,
          colorName: this.getColorName(hex),
          chemicalMatches: this.findChemicalMatches(hex, centroid)
        });
      }
    }

    // Sort by dominance
    return colors.sort((a, b) => b.dominance - a.dominance).slice(0, 6);
  }

  // Enhanced color extraction with adaptive sampling
  public analyzeImage(imageData: ImageData, width: number, height: number): AnalysisResult {
    const startTime = Date.now();
    const data = imageData.data;
    const pixels: { r: number; g: number; b: number; x: number; y: number }[] = [];

    // Adaptive sampling based on image size
    const totalPixels = width * height;
    let sampleRate = 1;
    
    if (totalPixels > 500000) sampleRate = 50;
    else if (totalPixels > 200000) sampleRate = 25;
    else if (totalPixels > 100000) sampleRate = 15;
    else if (totalPixels > 50000) sampleRate = 8;
    else sampleRate = 4;

    // Extract pixel data with sampling
    for (let i = 0; i < data.length; i += 4 * sampleRate) {
      const pixelIndex = i / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];

      // Skip transparent pixels and very dark/bright pixels that might be noise
      if (alpha < 128 || (r + g + b < 30) || (r + g + b > 750)) continue;

      pixels.push({ r, g, b, x, y });
    }

    // Perform clustering
    const colors = this.clusterColors(pixels, 8);

    // Analyze lighting conditions
    const lightingCondition = this.analyzeLighting(pixels);

    // Assess image quality
    const imageQuality = this.assessImageQuality(pixels, width, height);

    // Generate recommendations
    const recommendations = this.generateRecommendations(colors, lightingCondition, imageQuality);

    const processingTime = Date.now() - startTime;

    return {
      colors,
      dominantColor: colors[0],
      colorDistribution: this.calculateColorDistribution(colors),
      lightingCondition,
      imageQuality,
      recommendations: recommendations.en,
      recommendations_ar: recommendations.ar,
      processingTime
    };
  }

  // Helper methods
  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

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

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  private getColorName(hex: string): string {
    // Enhanced color naming with more chemical-relevant colors
    const colorNames: { [key: string]: string } = {
      '#FF0000': 'Red', '#00FF00': 'Green', '#0000FF': 'Blue',
      '#FFFF00': 'Yellow', '#FF00FF': 'Magenta', '#00FFFF': 'Cyan',
      '#800080': 'Purple', '#FFA500': 'Orange', '#FFC0CB': 'Pink',
      '#A52A2A': 'Brown', '#000000': 'Black', '#FFFFFF': 'White',
      '#808080': 'Gray', '#800000': 'Maroon', '#008000': 'Dark Green',
      '#000080': 'Navy', '#808000': 'Olive', '#4B0082': 'Indigo',
      '#8B4513': 'Saddle Brown', '#2F4F4F': 'Dark Slate Gray'
    };

    // Find closest color name
    let closestColor = 'Unknown';
    let minDistance = Infinity;

    Object.entries(colorNames).forEach(([colorHex, name]) => {
      const distance = this.calculateHexDistance(hex, colorHex);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = name;
      }
    });

    return closestColor;
  }

  private calculateHexDistance(hex1: string, hex2: string): number {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    if (!rgb1 || !rgb2) return Infinity;

    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private findChemicalMatches(hex: string, rgb: { r: number; g: number; b: number }): ChemicalMatch[] {
    const matches: ChemicalMatch[] = [];
    const lab = this.rgbToLab(rgb.r, rgb.g, rgb.b);

    this.colorDatabase.forEach(chemical => {
      const confidence = this.calculateChemicalConfidence(hex, rgb, lab, chemical);
      if (confidence > 0.3) { // Threshold for relevance
        matches.push({
          ...chemical,
          confidence: confidence * chemical.confidence
        });
      }
    });

    return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  private calculateChemicalConfidence(hex: string, rgb: { r: number; g: number; b: number }, lab: { l: number; a: number; b: number }, chemical: ChemicalMatch): number {
    // This is a simplified confidence calculation
    // In a real AI system, this would use trained models
    
    const colorRange = chemical.colorRange.toLowerCase();
    const colorName = this.getColorName(hex).toLowerCase();

    if (colorRange.includes(colorName)) {
      return 0.9;
    }

    // Check for color family matches
    if (colorRange.includes('purple') && (hex.includes('80') || hex.includes('4B'))) {
      return 0.8;
    }
    if (colorRange.includes('blue') && rgb.b > rgb.r && rgb.b > rgb.g) {
      return 0.7;
    }
    if (colorRange.includes('orange') && rgb.r > rgb.g && rgb.g > rgb.b) {
      return 0.7;
    }

    return 0.3; // Base confidence
  }

  private analyzeLighting(pixels: { r: number; g: number; b: number }[]): 'bright' | 'normal' | 'dim' | 'mixed' {
    const avgBrightness = pixels.reduce((sum, p) => sum + (p.r + p.g + p.b) / 3, 0) / pixels.length;
    
    if (avgBrightness > 200) return 'bright';
    if (avgBrightness < 80) return 'dim';
    if (avgBrightness > 120 && avgBrightness < 180) return 'normal';
    return 'mixed';
  }

  private assessImageQuality(pixels: { r: number; g: number; b: number }[], width: number, height: number): 'excellent' | 'good' | 'fair' | 'poor' {
    const resolution = width * height;
    const colorVariance = this.calculateColorVariance(pixels);

    if (resolution > 1000000 && colorVariance > 1000) return 'excellent';
    if (resolution > 500000 && colorVariance > 500) return 'good';
    if (resolution > 100000 && colorVariance > 200) return 'fair';
    return 'poor';
  }

  private calculateColorVariance(pixels: { r: number; g: number; b: number }[]): number {
    const avgR = pixels.reduce((sum, p) => sum + p.r, 0) / pixels.length;
    const avgG = pixels.reduce((sum, p) => sum + p.g, 0) / pixels.length;
    const avgB = pixels.reduce((sum, p) => sum + p.b, 0) / pixels.length;

    return pixels.reduce((sum, p) => {
      return sum + Math.pow(p.r - avgR, 2) + Math.pow(p.g - avgG, 2) + Math.pow(p.b - avgB, 2);
    }, 0) / pixels.length;
  }

  private calculateColorDistribution(colors: ColorData[]): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    colors.forEach(color => {
      distribution[color.colorName] = color.dominance;
    });
    return distribution;
  }

  private generateRecommendations(colors: ColorData[], lighting: string, quality: string): { en: string[]; ar: string[] } {
    const recommendations = { en: [], ar: [] };

    if (lighting === 'dim') {
      recommendations.en.push('Consider retaking the photo with better lighting for more accurate results');
      recommendations.ar.push('فكر في إعادة التقاط الصورة مع إضاءة أفضل للحصول على نتائج أكثر دقة');
    }

    if (quality === 'poor') {
      recommendations.en.push('Use a higher resolution camera for better color detection');
      recommendations.ar.push('استخدم كاميرا بدقة أعلى لكشف أفضل للألوان');
    }

    if (colors.length < 3) {
      recommendations.en.push('The image may have limited color variation. Try a different angle or lighting');
      recommendations.ar.push('قد تحتوي الصورة على تنوع محدود في الألوان. جرب زاوية أو إضاءة مختلفة');
    }

    return recommendations;
  }
}

// Export singleton instance
export const aiColorAnalyzer = new AIColorAnalyzer();
