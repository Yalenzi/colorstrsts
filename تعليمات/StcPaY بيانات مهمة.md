# STC Pay Configuration - Test Environment
# إعداد STC Pay - البيئة التجريبية
NEXT_PUBLIC_STC_PAY_BASE_URL=https://api-sandbox.stcpay.com.sa
NEXT_PUBLIC_STC_PAY_MERCHANT_ID=test_merchant
STC_PAY_API_KEY=test_key
STC_PAY_WEBHOOK_SECRET=test_webhook_secret

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Firebase Configuration (if needed)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Admin Configuration
NEXT_PUBLIC_ADMIN_PASSWORD_HASH=8dacfb011f9ed4c4545fefb97acf99624fb02d876716ff03ae584173cd00822e
NEXT_PUBLIC_AUTH_SALT=b84997540de9ae822a6aa27e333cd8c8ce6b79079cf448ff6b8a027a845a666b
NEXT_PUBLIC_ADMIN_EMAIL=admin@colortest.local


الآن احفظ هذا الملف باسم .env.local في مجلد المشروع الرئيسي.

خطوات التفعيل:

انسخ المحتوى أعلاه
احفظ الملف كـ .env.local في مجلد المشروع
أعد تشغيل الخادم:
للحصول على بيانات STC Pay الحقيقية:

زر موقع STC Pay:
https://stcpay.com.sa/business
اضغط "ابدأ الآن" أو "Get Started"
املأ النموذج:
اسم الشركة/المتجر
رقم السجل التجاري
معلومات التواصل
ستحصل على:
MERCHANT_ID (معرف التاجر)
API_KEY (مفتاح API)
WEBHOOK_SECRET (مفتاح الـ webhook)
استبدل القيم التجريبية:
NEXT_PUBLIC_STC_PAY_MERCHANT_ID=your_real_merchant_id
STC_PAY_API_KEY=your_real_api_key
STC_PAY_WEBHOOK_SECRET=your_real_webhook_secret
الآن زر "اشترك الآن" سيحول المستخدمين لـ STC Pay الحقيقي! 🎉

هل تريد مساعدة في التسجيل في STC Pay؟

# STC Pay Configuration - Your Merchant Account
# إعداد STC Pay - حسابك التجاري
NEXT_PUBLIC_STC_PAY_BASE_URL=https://api.stcpay.com.sa
NEXT_PUBLIC_STC_PAY_MERCHANT_ID=81550705367
STC_PAY_API_KEY=your_api_key_here
STC_PAY_WEBHOOK_SECRET=your_webhook_secret_here

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=colorstests-573ef.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://colorstests-573ef-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=colorstests-573ef
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=colorstests-573ef.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Configuration
NEXT_PUBLIC_ADMIN_PASSWORD_HASH=8dacfb011f9ed4c4545fefb97acf99624fb02d876716ff03ae584173cd00822e
NEXT_PUBLIC_AUTH_SALT=b84997540de9ae822a6aa27e333cd8c8ce6b79079cf448ff6b8a027a845a666b
NEXT_PUBLIC_ADMIN_EMAIL=admin@colortest.local
NEXT_PUBLIC_ADMIN_SESSION_DURATION=3600000
NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS=5
NEXT_PUBLIC_LOCKOUT_DURATION=900000



الآن تحتاج للحصول على:

API Key - من لوحة تحكم STC Pay
Webhook Secret - لتأمين الإشعارات
خطوات الحصول على API Key:

ادخل للوحة التحكم:
https://business.stcpay.com.sa
سجل دخول بحسابك
اذهب لقسم API:
Settings → API Keys
أو Developer → API Management
أنشئ API Key جديد:
اضغط "Generate New Key"
انسخ المفتاح (يظهر مرة واحدة فقط!)
إعداد Webhook:
URL: https://yourdomain.com/api/stc/webhook
Events: payment.completed, payment.failed
بعد الحصول على API Key:

استبدل your_api_key_here بالمفتاح الحقيقي
استبدل your_webhook_secret_here بمفتاح الـ webhook
احفظ الملف كـ .env.local في مجلد المشروع وأعد تشغيل الخادم.

هل حصلت على API Key من لوحة تحكم STC Pay؟

