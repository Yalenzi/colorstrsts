# 🧪 Color Testing System - نظام اختبارات الألوان

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Firebase](https://img.shields.io/badge/Firebase-9.0-orange?style=for-the-badge&logo=firebase)

**منصة متقدمة لاختبارات الكشف عن المواد الكيميائية باستخدام الألوان**

[🌐 Live Demo](https://colorstrsts.netlify.app) | [📖 Documentation](./docs) | [🎯 Features](#features)

</div>

## 🌟 المزايا الرئيسية

### 🎨 **واجهة مستخدم متطورة**
- **تصميم متجاوب** يدعم جميع الأجهزة (هواتف، أجهزة لوحية، أجهزة مكتبية)
- **دعم كامل للغتين** العربية والإنجليزية مع RTL/LTR
- **وضع مظلم/فاتح** قابل للتبديل
- **ألوان قابلة للتخصيص** مع نظام themes متقدم

### 🧪 **اختبارات كيميائية شاملة**
- **72 اختبار كيميائي** مختلف للكشف عن المواد
- **نتائج لونية دقيقة** مع تحليل تفصيلي
- **خطوات واضحة** لكل اختبار مع تحذيرات الأمان
- **تصنيف حسب الصعوبة** والفئة

### 👨‍💼 **لوحة إدارة متكاملة**
- **إدارة المستخدمين** مع جميع العمليات CRUD
- **إدارة الاختبارات** والنتائج اللونية
- **رسوم بيانية تفاعلية** للتحليلات
- **نظام إعدادات شامل** للتخصيص
- **أداة اختبار النظام** للتحقق من الوظائف

### 🔒 **أمان وأداء عالي**
- **تشفير البيانات** مع Firebase
- **نظام مصادقة آمن** مع إدارة الجلسات
- **تحسين الصور** والتخزين المؤقت
- **حماية من الهجمات** مع headers أمان

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+ 
- npm أو yarn
- حساب Firebase (اختياري)

### التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/Yalenzi/colorstrsts.git
cd colorstrsts

# تثبيت المكتبات
npm install

# تشغيل الخادم المحلي
npm run dev
```

### البناء للإنتاج

```bash
# بناء المشروع
npm run build

# بناء مبسط للنشر الثابت
npm run build:simple

# معاينة البناء
npm run start
```

## 📁 هيكل المشروع

```
src/
├── app/                    # Next.js App Router
├── components/            
│   ├── admin/             # لوحة الإدارة
│   ├── auth/              # نظام المصادقة
│   ├── tests/             # مكونات الاختبارات
│   └── ui/                # مكونات واجهة المستخدم
├── lib/                   # المكتبات والخدمات
├── hooks/                 # React Hooks مخصصة
├── types/                 # تعريفات TypeScript
└── data/                  # بيانات الاختبارات
```

## 🎯 الاختبارات المتاحة

### اختبارات المنشطات
- Marquis Test
- Simon Test  
- Mecke Test
- Liebermann Test

### اختبارات المواد الأفيونية
- Nitric Acid Test (Heroin/Morphine/Codeine)
- Mecke Test (PCP)
- Wagner Test

### اختبارات المهلوسات
- Ehrlich Test
- Duquenois-Levine Test
- Fast Blue B Salt Test

### اختبارات أخرى
- Cobalt Thiocyanate Test
- Zimmermann Test
- Dille-Koppanyi Test
- وأكثر من 60 اختبار آخر...

## 🛠️ التقنيات المستخدمة

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Backend**: Firebase Realtime Database
- **Authentication**: Custom Auth System
- **Deployment**: Netlify (Static Export)
- **State Management**: React Context
- **Forms**: React Hook Form
- **Notifications**: Sonner

## 📊 إحصائيات الأداء

- **138 صفحة ثابتة** تم إنشاؤها
- **542KB** حجم لوحة الإدارة (محسّنة)
- **19.2KB** متوسط حجم صفحات الاختبارات
- **6.99KB** حجم الصفحة الرئيسية
- **دعم كامل للـ SEO** مع meta tags

## 🌐 النشر

### Netlify (موصى به)
```bash
# بناء للنشر الثابت
npm run build:simple

# رفع مجلد out/ إلى Netlify
```

### Vercel
```bash
# ربط المشروع
vercel --prod
```

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📝 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 👨‍💻 المطور

**Yalenzi**
- GitHub: [@Yalenzi](https://github.com/Yalenzi)
- Email: ararsmomarar@gmail.com

## 🙏 شكر وتقدير

- [Next.js](https://nextjs.org/) - إطار العمل الرائع
- [Tailwind CSS](https://tailwindcss.com/) - للتصميم السريع
- [Lucide](https://lucide.dev/) - للأيقونات الجميلة
- [Firebase](https://firebase.google.com/) - لقاعدة البيانات

---

<div align="center">

**⭐ إذا أعجبك المشروع، لا تنس إعطاؤه نجمة! ⭐**

Made with ❤️ by [Yalenzi](https://github.com/Yalenzi)

</div>
