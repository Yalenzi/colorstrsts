'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BeakerIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface ChemicalComponent {
  id: string;
  name: string;
  name_ar: string;
  formula?: string;
  concentration?: string;
  safety_level: 'low' | 'medium' | 'high' | 'critical';
  hazard_symbols: string[];
  storage_requirements: string;
  storage_requirements_ar: string;
  used_in_tests: string[];
}

interface ChemicalComponentsManagementProps {
  lang: Language;
}

export function ChemicalComponentsManagement({ lang }: ChemicalComponentsManagementProps) {
  const [components, setComponents] = useState<ChemicalComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSafety, setSelectedSafety] = useState<string>('all');
  const [editingComponent, setEditingComponent] = useState<ChemicalComponent | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة المكونات الكيميائية' : 'Chemical Components Management',
    subtitle: isRTL ? 'إدارة المواد الكيميائية المستخدمة في الاختبارات' : 'Manage chemical substances used in tests',
    search: isRTL ? 'البحث في المكونات...' : 'Search components...',
    safety: isRTL ? 'مستوى الأمان' : 'Safety Level',
    allSafety: isRTL ? 'جميع المستويات' : 'All Safety Levels',
    addComponent: isRTL ? 'إضافة مكون جديد' : 'Add New Component',
    edit: isRTL ? 'تحرير' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete',
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    name: isRTL ? 'الاسم' : 'Name',
    formula: isRTL ? 'الصيغة الكيميائية' : 'Chemical Formula',
    concentration: isRTL ? 'التركيز' : 'Concentration',
    storage: isRTL ? 'متطلبات التخزين' : 'Storage Requirements',
    usedInTests: isRTL ? 'مستخدم في الاختبارات' : 'Used in Tests',
    hazardSymbols: isRTL ? 'رموز الخطر' : 'Hazard Symbols',
    noComponents: isRTL ? 'لا توجد مكونات' : 'No components found',
    loading: isRTL ? 'جاري التحميل...' : 'Loading...',
    safetyLevels: {
      low: isRTL ? 'منخفض' : 'Low',
      medium: isRTL ? 'متوسط' : 'Medium',
      high: isRTL ? 'عالي' : 'High',
      critical: isRTL ? 'حرج' : 'Critical'
    }
  };

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      console.log('🔄 Loading chemical components...');
      setLoading(true);
      
      // تحميل من localStorage أو إنشاء بيانات تجريبية
      const savedComponents = localStorage.getItem('chemical_components_admin');
      let componentsData: ChemicalComponent[] = [];

      if (savedComponents) {
        componentsData = JSON.parse(savedComponents);
        console.log('📦 Loaded components from localStorage:', componentsData.length);
      } else {
        // إنشاء بيانات تجريبية من المكونات المعروفة
        componentsData = createSampleComponents();
        localStorage.setItem('chemical_components_admin', JSON.stringify(componentsData));
        console.log('🆕 Created sample components:', componentsData.length);
      }
      
      setComponents(componentsData);
      console.log('✅ Chemical components loaded successfully:', componentsData.length);
      
    } catch (error) {
      console.error('❌ Error loading components:', error);
      toast.error(isRTL ? 'خطأ في تحميل المكونات' : 'Error loading components');
    } finally {
      setLoading(false);
    }
  };

  const createSampleComponents = (): ChemicalComponent[] => {
    const allComponents = [
      'Formaldehyde solution (37%)', 'Glacial acetic acid', 'Concentrated sulfuric acid',
      'Ferric sulfate', 'Water', 'Selenious acid', 'Concentrated nitric acid',
      'Fast blue B salt', 'Anhydrous sodium sulfate', 'Chloroform', 'Sodium hydroxide',
      'Vanillin', 'Ethanol (95%)', 'Acetaldehyde', 'Concentrated hydrochloric acid',
      'Hydrochloric acid (16% aqueous)', 'Cobalt(II) thiocyanate', 'Acetic acid (10% vol/vol)',
      'Glycerine', 'Potassium hydroxide', 'Absolute methanol', 'Iodine', 'Potassium iodide',
      'Sodium nitroprusside', 'Sodium carbonate', 'Acetone (5% vol/vol aqueous)',
      'Gallic acid', '1,3-dinitrobenzene', 'Methanol', '1,2-dinitrobenzene',
      'Polyethylene glycol', 'Lithium hydroxide', '1,4-dinitrobenzene',
      'Cobalt(II) acetate tetrahydrate', 'Isopropylamine', 'Hydrochloric acid (2N, approx. 7.3%)',
      '4-dimethylaminobenzaldehyde', 'Concentrated ortho-phosphoric acid',
      'Sodium nitrite', 'Copper(II) sulfate'
    ];

    return allComponents.map((component, index) => ({
      id: `comp-${index + 1}`,
      name: component,
      name_ar: getArabicName(component),
      formula: getChemicalFormula(component),
      concentration: getConcentration(component),
      safety_level: getSafetyLevel(component),
      hazard_symbols: getHazardSymbols(component),
      storage_requirements: getStorageRequirements(component),
      storage_requirements_ar: getStorageRequirementsAr(component),
      used_in_tests: getUsedInTests(component)
    }));
  };

  // دوال مساعدة لإنشاء البيانات التجريبية
  const getArabicName = (name: string): string => {
    const arabicNames: { [key: string]: string } = {
      'Formaldehyde solution (37%)': 'محلول الفورمالديهايد (37%)',
      'Glacial acetic acid': 'حمض الخليك الجليدي',
      'Concentrated sulfuric acid': 'حمض الكبريتيك المركز',
      'Ferric sulfate': 'كبريتات الحديديك',
      'Water': 'الماء',
      'Selenious acid': 'حمض السيلينيوز',
      'Concentrated nitric acid': 'حمض النيتريك المركز',
      'Fast blue B salt': 'ملح الأزرق السريع ب',
      'Anhydrous sodium sulfate': 'كبريتات الصوديوم اللامائية',
      'Chloroform': 'الكلوروفورم',
      'Sodium hydroxide': 'هيدروكسيد الصوديوم',
      'Vanillin': 'الفانيلين',
      'Ethanol (95%)': 'الإيثانول (95%)',
      'Acetaldehyde': 'الأسيتالديهايد',
      'Concentrated hydrochloric acid': 'حمض الهيدروكلوريك المركز'
    };
    return arabicNames[name] || name;
  };

  const getChemicalFormula = (name: string): string => {
    const formulas: { [key: string]: string } = {
      'Water': 'H₂O',
      'Concentrated sulfuric acid': 'H₂SO₄',
      'Concentrated nitric acid': 'HNO₃',
      'Sodium hydroxide': 'NaOH',
      'Chloroform': 'CHCl₃',
      'Ethanol (95%)': 'C₂H₅OH',
      'Concentrated hydrochloric acid': 'HCl',
      'Sodium carbonate': 'Na₂CO₃',
      'Potassium hydroxide': 'KOH',
      'Methanol': 'CH₃OH',
      'Potassium iodide': 'KI',
      'Sodium nitrite': 'NaNO₂'
    };
    return formulas[name] || '';
  };

  const getConcentration = (name: string): string => {
    if (name.includes('(') && name.includes(')')) {
      const match = name.match(/\(([^)]+)\)/);
      return match ? match[1] : '';
    }
    return '';
  };

  const getSafetyLevel = (name: string): 'low' | 'medium' | 'high' | 'critical' => {
    if (name.includes('Concentrated') || name.includes('acid')) return 'high';
    if (name.includes('Chloroform') || name.includes('nitro')) return 'critical';
    if (name.includes('Water') || name.includes('salt')) return 'low';
    return 'medium';
  };

  const getHazardSymbols = (name: string): string[] => {
    const symbols = [];
    if (name.includes('acid')) symbols.push('Corrosive');
    if (name.includes('Chloroform')) symbols.push('Toxic', 'Carcinogenic');
    if (name.includes('nitro')) symbols.push('Explosive', 'Toxic');
    if (name.includes('Concentrated')) symbols.push('Corrosive');
    return symbols.length > 0 ? symbols : ['Safe'];
  };

  const getStorageRequirements = (name: string): string => {
    if (name.includes('acid')) return 'Store in acid-resistant container, cool dry place';
    if (name.includes('Chloroform')) return 'Store in dark, cool place, away from light';
    return 'Store in cool, dry place';
  };

  const getStorageRequirementsAr = (name: string): string => {
    if (name.includes('acid')) return 'يُحفظ في وعاء مقاوم للأحماض، مكان بارد وجاف';
    if (name.includes('Chloroform')) return 'يُحفظ في مكان مظلم وبارد، بعيداً عن الضوء';
    return 'يُحفظ في مكان بارد وجاف';
  };

  const getUsedInTests = (componentName: string): string[] => {
    const testUsage: { [key: string]: string[] } = {
      'Concentrated sulfuric acid': ['Marquis Test', 'Mecke Test', 'Gallic Acid Test'],
      'Formaldehyde solution (37%)': ['Marquis Test'],
      'Glacial acetic acid': ['Marquis Test'],
      'Ferric sulfate': ['Ferric Sulfate Test'],
      'Water': ['Ferric Sulfate Test', 'Wagner Test', 'Simon Test', 'Chen-Kao Test'],
      'Selenious acid': ['Mecke Test'],
      'Concentrated nitric acid': ['Nitric Acid Test', 'Vitali-Morin Test'],
      'Chloroform': ['Fast Blue B Salt Test', 'Duquenois-Levine Test', 'Modified Cobalt Thiocyanate Test'],
      'Sodium hydroxide': ['Fast Blue B Salt Test', 'Chen-Kao Test']
    };
    return testUsage[componentName] || [];
  };

  const saveComponents = (updatedComponents: ChemicalComponent[]) => {
    setComponents(updatedComponents);
    localStorage.setItem('chemical_components_admin', JSON.stringify(updatedComponents));
    console.log('💾 Components saved to localStorage:', updatedComponents.length);
    toast.success(isRTL ? 'تم حفظ المكونات بنجاح' : 'Components saved successfully');
  };

  const handleAddComponent = () => {
    const newComponent: ChemicalComponent = {
      id: `comp-${Date.now()}`,
      name: '',
      name_ar: '',
      formula: '',
      concentration: '',
      safety_level: 'medium',
      hazard_symbols: [],
      storage_requirements: '',
      storage_requirements_ar: '',
      used_in_tests: []
    };
    setEditingComponent(newComponent);
    setShowAddDialog(true);
  };

  const handleEditComponent = (component: ChemicalComponent) => {
    setEditingComponent({ ...component });
    setShowEditDialog(true);
  };

  const handleDeleteComponent = (componentId: string) => {
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا المكون؟' : 'Are you sure you want to delete this component?')) {
      const updatedComponents = components.filter(comp => comp.id !== componentId);
      saveComponents(updatedComponents);
      toast.success(isRTL ? 'تم حذف المكون' : 'Component deleted');
    }
  };

  const handleSaveComponent = () => {
    if (!editingComponent) return;

    if (!editingComponent.name.trim()) {
      toast.error(isRTL ? 'اسم المكون مطلوب' : 'Component name is required');
      return;
    }

    let updatedComponents;
    if (showAddDialog) {
      // إضافة مكون جديد
      updatedComponents = [...components, editingComponent];
      setShowAddDialog(false);
    } else {
      // تحديث مكون موجود
      updatedComponents = components.map(comp =>
        comp.id === editingComponent.id ? editingComponent : comp
      );
      setShowEditDialog(false);
    }

    saveComponents(updatedComponents);
    setEditingComponent(null);
  };

  const getSafetyBadgeColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // فلترة المكونات
  const filteredComponents = components.filter(component => {
    const matchesSearch = searchQuery === '' || 
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.name_ar.includes(searchQuery) ||
      (component.formula && component.formula.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSafety = selectedSafety === 'all' || component.safety_level === selectedSafety;

    return matchesSearch && matchesSafety;
  });

  const safetyLevels = ['low', 'medium', 'high', 'critical'];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">{texts.loading}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BeakerIcon className="h-6 w-6 text-primary" />
            {texts.title}
          </h2>
          <p className="text-gray-600 mt-1">{texts.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadComponents} variant="outline" size="sm">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            {texts.refresh}
          </Button>
          <Button onClick={handleAddComponent} size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            {texts.addComponent}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={texts.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Safety Filter */}
            <select
              value={selectedSafety}
              onChange={(e) => setSelectedSafety(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{texts.allSafety}</option>
              {safetyLevels.map(level => (
                <option key={level} value={level}>
                  {texts.safetyLevels[level as keyof typeof texts.safetyLevels]}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BeakerIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'إجمالي المكونات' : 'Total Components'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{components.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'مكونات عالية الخطورة' : 'High Risk Components'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {components.filter(c => c.safety_level === 'high' || c.safety_level === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'مكونات آمنة' : 'Safe Components'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {components.filter(c => c.safety_level === 'low').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'النتائج المفلترة' : 'Filtered Results'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{filteredComponents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Components List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BeakerIcon className="h-5 w-5" />
            {isRTL ? 'قائمة المكونات الكيميائية' : 'Chemical Components List'}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? `عرض ${filteredComponents.length} من أصل ${components.length} مكون`
              : `Showing ${filteredComponents.length} of ${components.length} components`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredComponents.length === 0 ? (
            <div className="text-center py-12">
              <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{texts.noComponents}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComponents.map((component) => (
                <Card key={component.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {isRTL ? component.name_ar : component.name}
                          </h3>
                          <Badge className={getSafetyBadgeColor(component.safety_level)}>
                            {texts.safetyLevels[component.safety_level]}
                          </Badge>
                          {component.formula && (
                            <Badge variant="outline" className="font-mono">
                              {component.formula}
                            </Badge>
                          )}
                        </div>

                        {component.concentration && (
                          <p className="text-sm text-gray-600 mb-2">
                            {isRTL ? 'التركيز:' : 'Concentration:'} {component.concentration}
                          </p>
                        )}

                        {component.hazard_symbols.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {component.hazard_symbols.map((symbol, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {symbol}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {component.used_in_tests.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">
                              {isRTL ? 'مستخدم في:' : 'Used in:'} 
                            </span>
                            <span className="ml-1">
                              {component.used_in_tests.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditComponent(component)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteComponent(component.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Component Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setEditingComponent(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BeakerIcon className="h-5 w-5" />
              {showAddDialog 
                ? (isRTL ? 'إضافة مكون جديد' : 'Add New Component')
                : (isRTL ? 'تحرير المكون' : 'Edit Component')
              }
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'أدخل تفاصيل المكون الكيميائي'
                : 'Enter the chemical component details'
              }
            </DialogDescription>
          </DialogHeader>
          
          {editingComponent && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}
                    </label>
                    <Input
                      value={editingComponent.name}
                      onChange={(e) => setEditingComponent({...editingComponent, name: e.target.value})}
                      placeholder={isRTL ? 'أدخل الاسم بالإنجليزية' : 'Enter English name'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}
                    </label>
                    <Input
                      value={editingComponent.name_ar}
                      onChange={(e) => setEditingComponent({...editingComponent, name_ar: e.target.value})}
                      placeholder={isRTL ? 'أدخل الاسم بالعربية' : 'Enter Arabic name'}
                    />
                  </div>
                </div>

                {/* Formula and Concentration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {texts.formula}
                    </label>
                    <Input
                      value={editingComponent.formula || ''}
                      onChange={(e) => setEditingComponent({...editingComponent, formula: e.target.value})}
                      placeholder="H₂SO₄"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {texts.concentration}
                    </label>
                    <Input
                      value={editingComponent.concentration || ''}
                      onChange={(e) => setEditingComponent({...editingComponent, concentration: e.target.value})}
                      placeholder="37%, 95%, etc."
                    />
                  </div>
                </div>

                {/* Safety Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {texts.safety}
                  </label>
                  <select
                    value={editingComponent.safety_level}
                    onChange={(e) => setEditingComponent({...editingComponent, safety_level: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {safetyLevels.map(level => (
                      <option key={level} value={level}>
                        {texts.safetyLevels[level as keyof typeof texts.safetyLevels]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Storage Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'متطلبات التخزين (إنجليزي)' : 'Storage Requirements (English)'}
                    </label>
                    <Input
                      value={editingComponent.storage_requirements}
                      onChange={(e) => setEditingComponent({...editingComponent, storage_requirements: e.target.value})}
                      placeholder={isRTL ? 'أدخل متطلبات التخزين' : 'Enter storage requirements'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'متطلبات التخزين (عربي)' : 'Storage Requirements (Arabic)'}
                    </label>
                    <Input
                      value={editingComponent.storage_requirements_ar}
                      onChange={(e) => setEditingComponent({...editingComponent, storage_requirements_ar: e.target.value})}
                      placeholder={isRTL ? 'أدخل متطلبات التخزين بالعربية' : 'Enter Arabic storage requirements'}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setShowEditDialog(false);
              setEditingComponent(null);
            }}>
              {texts.cancel}
            </Button>
            <Button onClick={handleSaveComponent}>
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              {texts.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
