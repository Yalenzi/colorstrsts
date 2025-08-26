# 🔒 دليل إصلاح Content Security Policy للـ Google APIs

## ❌ المشكلة الأصلية
```
Refused to load the script 'https://apis.google.com/js/api.js?onload=__iframefcb101962' 
because it violates the following Content Security Policy directive: "script-src..."
```

## ✅ الحل المطبق

### 1. **تحديث CSP في middleware.ts** 🔧
```typescript
// تم إضافة https://apis.google.com إلى script-src
"script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' " +
  "https://www.gstatic.com " +
  "https://www.googleapis.com " +
  "https://apis.google.com " +          // ← تم إضافة هذا
  "https://accounts.google.com " +
  // ... باقي المصادر
```

### 2. **تحديث CSP في security middleware** 🔧
```typescript
// تم إضافة Google APIs domains
"script-src 'self' 'unsafe-inline' 'unsafe-eval' " +
  "https://www.gstatic.com " +
  "https://www.googleapis.com " +
  "https://apis.google.com " +          // ← تم إضافة هذا
  "https://accounts.google.com; "       // ← تم إضافة هذا
```

### 3. **تحديث CSP في _headers** 🔧
```
Content-Security-Policy: 
  script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' 
    https://www.gstatic.com 
    https://www.googleapis.com 
    https://apis.google.com           ← تم إضافة هذا
    https://accounts.google.com 
    ...
  frame-src 'self' 
    https://accounts.google.com       ← تم إضافة هذا للنوافذ المنبثقة
    https://*.firebaseapp.com
```

## 🎯 المصادر المطلوبة لـ Google Sign-In

### **Script Sources:**
- `https://apis.google.com` - Google APIs JavaScript library
- `https://www.googleapis.com` - Google APIs endpoints
- `https://accounts.google.com` - Google Accounts authentication
- `https://www.gstatic.com` - Google static resources

### **Frame Sources:**
- `https://accounts.google.com` - Google OAuth popup/iframe
- `https://*.firebaseapp.com` - Firebase authentication frames

### **Connect Sources:**
- `https://identitytoolkit.googleapis.com` - Firebase Auth API
- `https://securetoken.googleapis.com` - Firebase token service
- `https://www.googleapis.com` - Google API calls

## 🧪 اختبار الإصلاح

### 1. **رفع التحديثات:**
```bash
git add .
git commit -m "Fix CSP for Google APIs and Sign-In"
git push
```

### 2. **اختبار Google Sign-In:**
```
1. اذهب إلى: https://colorstest.com/ar/auth-test/google-signin
2. افتح Developer Tools → Console
3. اضغط على زر "اختبار تسجيل الدخول بـ Google"
4. تحقق من عدم وجود أخطاء CSP
```

### 3. **مراقبة Console:**
```javascript
// يجب ألا تظهر هذه الأخطاء بعد الآن:
❌ "Refused to load the script 'https://apis.google.com/js/api.js'"
❌ "Content Security Policy directive: script-src"

// يجب أن تظهر هذه الرسائل:
✅ "🔄 Starting Google Sign-In..."
✅ "✅ Google Sign-In successful"
```

## 🔍 استكشاف الأخطاء

### **إذا استمرت مشاكل CSP:**

#### 1. **تحقق من أولوية Headers:**
```
Netlify _headers > middleware.ts > Next.js config
```

#### 2. **تحقق من Cache:**
```bash
# امسح cache المتصفح
Ctrl+Shift+R (Hard Refresh)
# أو
Developer Tools → Application → Storage → Clear storage
```

#### 3. **تحقق من Netlify Headers:**
```bash
# في Netlify Dashboard:
Site Settings → Build & Deploy → Post processing → Headers
```

### **أخطاء شائعة أخرى:**

#### خطأ "frame-ancestors":
```
الحل: إضافة frame-src 'self' https://accounts.google.com
```

#### خطأ "connect-src":
```
الحل: إضافة https://identitytoolkit.googleapis.com
```

#### خطأ "img-src":
```
الحل: إضافة https://*.googleapis.com للصور
```

## 📋 قائمة التحقق النهائية

- [x] **تحديث middleware.ts** - إضافة apis.google.com
- [x] **تحديث security middleware** - إضافة Google domains
- [x] **تحديث _headers** - توحيد CSP وإضافة frame-src
- [x] **إضافة frame-src** - للنوافذ المنبثقة
- [ ] **رفع التحديثات** - git push
- [ ] **اختبار Google Sign-In** - في البيئة المباشرة
- [ ] **مراقبة Console** - للتأكد من عدم وجود أخطاء

## 🎯 النتيجة المتوقعة

بعد تطبيق هذه الإصلاحات:
- ✅ لا توجد أخطاء CSP في Console
- ✅ Google Sign-In يعمل بدون مشاكل
- ✅ النوافذ المنبثقة تفتح بشكل صحيح
- ✅ تسجيل الدخول ينجح ويحفظ الجلسة
- ✅ الأمان محافظ عليه مع السماح للمصادر المطلوبة فقط

## 🚨 ملاحظات أمنية

### **المصادر المضافة آمنة:**
- `apis.google.com` - مصدر رسمي من Google
- `accounts.google.com` - خدمة المصادقة الرسمية
- جميع المصادر تستخدم HTTPS
- لا توجد مصادر خارجية غير موثوقة

### **الحماية المحافظ عليها:**
- `'unsafe-eval'` محدود للضرورة فقط
- `frame-ancestors 'none'` يمنع embedding
- `object-src 'none'` يمنع plugins خطيرة
- جميع المصادر محددة بدقة
