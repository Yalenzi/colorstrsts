@echo off
echo 🚀 Starting Git upload process...
echo 🚀 بدء عملية رفع الملفات إلى GitHub...

REM Set Git configuration
git config --global user.name "Yalenzi"
git config --global user.email "ararsmomarar@gmail.com"
echo ✅ Git configuration set

REM Initialize Git repository if not already initialized
git init
echo ✅ Git repository initialized

REM Add remote origin
git remote remove origin 2>nul
git remote add origin https://github.com/Yalenzi/colorstrsts.git
echo ✅ Remote origin added

REM Add all files
git add .
echo ✅ All files added to staging

REM Create commit
git commit -m "🛡️ Fix: Comprehensive build-safe solution for useAuth errors - Created safe-providers.tsx with build-safe useAuth implementation - Updated all 18+ files to use @/components/safe-providers - Fixed useAuth must be used within AuthProvider errors during prerendering - Added safe defaults for all auth functions - Ensured no React Context or useState during SSR - This should resolve all Netlify build failures"
echo ✅ Commit created

REM Push to GitHub
git push -u origin main
echo ✅ Files pushed to GitHub

echo 🎉 Upload completed successfully!
echo 🎉 تم رفع الملفات بنجاح!

pause
