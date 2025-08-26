@echo off
echo Creating upload package...

REM Create a directory for important files
mkdir upload-package 2>nul

REM Copy the most important files
echo Copying critical files...
copy "src\components\safe-providers.tsx" "upload-package\" 2>nul
copy "src\app\layout.tsx" "upload-package\" 2>nul
copy "src\app\[lang]\layout.tsx" "upload-package\" 2>nul
copy "src\hooks\useAuth.ts" "upload-package\" 2>nul
copy "MANUAL_UPLOAD_GUIDE.md" "upload-package\" 2>nul
copy "simple-upload.bat" "upload-package\" 2>nul

echo Package created in 'upload-package' folder
echo You can now upload these files manually to GitHub

pause
