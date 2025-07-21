@echo off
echo 🚀 رفع التعديلات الجديدة إلى GitHub
echo 🚀 Uploading new changes to GitHub
echo.

echo ⏳ إضافة جميع الملفات...
echo ⏳ Adding all files...
git add .

echo ⏳ إنشاء commit...
echo ⏳ Creating commit...
git commit -m "✨ Major Updates: History Page, English Default, Popup Disable

🔧 Features Added:
- ✅ Fixed 404 History page - Added complete history functionality
- 🌐 Changed default language from Arabic to English
- 🚫 Disabled all popup notifications and welcome messages
- ⚡ Reduced toast notification duration (4s → 2s)
- 📱 Added advanced image analyzer with chemical identification
- 🎨 Added new UI components: Progress, Tabs, Badge

📁 New Files:
- src/app/[lang]/history/page.tsx
- src/components/pages/history-page.tsx
- src/components/ui/progress.tsx
- middleware.ts
- POPUP_DISABLE_GUIDE.md

🔄 Modified Files:
- public/browserconfig.xml (removed notifications)
- src/components/profile/WelcomeMessage.tsx (disabled)
- src/components/ui/toaster.tsx (reduced duration)
- src/components/pages/image-analyzer-page.tsx (enhanced)
- package.json (added @radix-ui/react-progress)

🎯 Result:
- No more annoying popups
- English as default language
- Working history page
- Better user experience

Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Version: 2.0.0"

echo ⏳ رفع التعديلات...
echo ⏳ Pushing changes...
git push origin main

echo.
echo ✅ تم رفع التعديلات بنجاح!
echo ✅ Changes uploaded successfully!
echo.
pause
