# 🌐 دليل إعداد النطاق المخصص colorstest.com

## ✅ حالة النطاق الحالية
```
✅ النطاق: colorstest.com
✅ النطاق الفرعي: www.colorstest.com
✅ مربوط بـ Netlify: color-testing-drug.netlify.app
✅ Name Servers: nsone.net (محدث)
```

## 🔧 الخطوات المطلوبة الآن

### 1. **تحديث متغيرات البيئة في Netlify** ⚙️

اذهب إلى Netlify Dashboard → Site Settings → Environment Variables:

```bash
# إضافة/تحديث هذه المتغيرات:
NEXT_PUBLIC_SITE_URL=https://colorstest.com
NEXT_PUBLIC_GOOGLE_VERIFICATION=your_verification_code
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=colorstests-573ef.firebaseapp.com
```

### 2. **إعداد Google Search Console** 🔍

#### أ. إضافة النطاق الجديد:
```
1. اذهب إلى: https://search.google.com/search-console
2. اضغط "Add Property"
3. اختر "Domain" (ليس URL prefix)
4. أدخل: colorstest.com
5. تحقق من الملكية عبر DNS
```

#### ب. التحقق من الملكية عبر DNS:
```
1. Google سيعطيك TXT record
2. أضف هذا Record في DNS settings:
   Type: TXT
   Name: @
   Value: google-site-verification=YOUR_CODE
3. انتظر حتى ينتشر DNS (5-60 دقيقة)
4. اضغط "Verify" في Google Search Console
```

### 3. **إعداد Firebase Authentication** 🔐

#### أ. إضافة النطاقات المصرح بها:
```
1. اذهب إلى Firebase Console
2. Authentication → Settings → Authorized domains
3. أضف:
   - colorstest.com
   - www.colorstest.com
   - color-testing-drug.netlify.app (احتفظ بهذا كـ backup)
```

### 4. **إعداد Redirects في Netlify** 🔄

أنشئ ملف `_redirects` في مجلد `public`:

```
# Redirect www to non-www
https://www.colorstest.com/* https://colorstest.com/:splat 301!

# Redirect old Netlify domain to new domain
https://color-testing-drug.netlify.app/* https://colorstest.com/:splat 301!

# Force HTTPS
http://colorstest.com/* https://colorstest.com/:splat 301!
```

### 5. **تحديث Sitemap URLs** 🗺️

الملفات تم تحديثها تلقائياً لتستخدم:
```
✅ src/app/sitemap.ts - يستخدم NEXT_PUBLIC_SITE_URL
✅ src/app/robots.ts - يستخدم NEXT_PUBLIC_SITE_URL
✅ src/app/layout.tsx - metadataBase محدث
```

## 📋 قائمة التحقق

### ✅ **تم إنجازه:**
- [x] إعداد DNS records
- [x] ربط النطاق بـ Netlify
- [x] تحديث ملفات SEO

### 🔄 **المطلوب الآن:**
- [ ] تحديث متغيرات البيئة في Netlify
- [ ] إضافة النطاق في Google Search Console
- [ ] التحقق من ملكية النطاق عبر DNS
- [ ] إضافة النطاقات في Firebase Auth
- [ ] إنشاء ملف _redirects
- [ ] إرسال Sitemap الجديد
- [ ] اختبار Google Sign-In مع النطاق الجديد

## 🧪 اختبار النطاق الجديد

### 1. **اختبار الوصول:**
```bash
# تحقق من أن هذه الروابط تعمل:
https://colorstest.com
https://www.colorstest.com (يجب أن يحول إلى colorstest.com)
https://colorstest.com/ar
https://colorstest.com/en
```

### 2. **اختبار Google Sign-In:**
```bash
# اذهب إلى:
https://colorstest.com/ar/auth-test/google-signin
# واختبر تسجيل الدخول
```

### 3. **اختبار SEO:**
```bash
# تحقق من:
https://colorstest.com/sitemap.xml
https://colorstest.com/robots.txt
```

## 🚨 مشاكل محتملة وحلولها

### 1. **خطأ "Unauthorized domain" في Google Sign-In:**
```
الحل: إضافة colorstest.com في Firebase → Authentication → Authorized domains
```

### 2. **Sitemap لا يظهر:**
```
الحل: 
1. تحقق من NEXT_PUBLIC_SITE_URL في Netlify
2. أعد نشر الموقع
3. انتظر 5-10 دقائق
```

### 3. **Google Search Console لا يتحقق من الملكية:**
```
الحل:
1. تأكد من إضافة TXT record بشكل صحيح
2. انتظر حتى ينتشر DNS (استخدم: https://dnschecker.org)
3. حاول مرة أخرى
```

## 📈 الخطوات التالية بعد الإعداد

### 1. **مراقبة الأداء:**
```
- Google Search Console → Performance
- مراقبة الفهرسة والأخطاء
- تحليل الكلمات المفتاحية
```

### 2. **تحسين SEO:**
```
- إضافة محتوى جديد بانتظام
- تحسين سرعة الموقع
- بناء روابط خارجية
```

### 3. **مراقبة الأمان:**
```
- تفعيل SSL/TLS
- مراقبة أخطاء الأمان
- تحديث Firebase rules
```

## 🎯 النتيجة المتوقعة

بعد تطبيق هذه الخطوات:
- ✅ الموقع يعمل على colorstest.com
- ✅ Google Sign-In يعمل مع النطاق الجديد
- ✅ SEO محسن للنطاق المخصص
- ✅ الموقع مفهرس في Google
- ✅ جميع الروابط تحول إلى النطاق الصحيح
