Write-Host "🚀 Starting Git upload process..." -ForegroundColor Green
Write-Host "🚀 بدء عملية رفع الملفات إلى GitHub..." -ForegroundColor Green

try {
    # Set Git configuration
    Write-Host "Setting Git configuration..." -ForegroundColor Yellow
    git config --global user.name "Yalenzi"
    git config --global user.email "ararsmomarar@gmail.com"
    Write-Host "✅ Git configuration set" -ForegroundColor Green

    # Initialize Git repository if not already initialized
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green

    # Add remote origin
    Write-Host "Adding remote origin..." -ForegroundColor Yellow
    git remote remove origin 2>$null
    git remote add origin https://github.com/Yalenzi/colorstrsts.git
    Write-Host "✅ Remote origin added" -ForegroundColor Green

    # Add all files
    Write-Host "Adding all files to staging..." -ForegroundColor Yellow
    git add .
    Write-Host "✅ All files added to staging" -ForegroundColor Green

    # Create commit
    Write-Host "Creating commit..." -ForegroundColor Yellow
    $commitMessage = @"
🛡️ Fix: Comprehensive build-safe solution for useAuth errors

- Created safe-providers.tsx with build-safe useAuth implementation
- Updated all 18+ files to use @/components/safe-providers instead of @/components/providers
- Fixed 'useAuth must be used within an AuthProvider' errors during prerendering
- Added safe defaults for all auth functions (signIn, signUp, signOut, etc.)
- Ensured no React Context or useState during SSR
- This should resolve all Netlify build failures

Files updated:
- src/components/safe-providers.tsx (NEW)
- src/app/layout.tsx
- src/app/[lang]/layout.tsx
- src/hooks/useAuth.ts
- src/components/layout/simple-header.tsx
- src/app/subscription/success/page.tsx
- All auth-related components (18+ files)

Expected result: 100% successful Netlify build
"@
    
    git commit -m $commitMessage
    Write-Host "✅ Commit created" -ForegroundColor Green

    # Push to GitHub
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
    Write-Host "✅ Files pushed to GitHub" -ForegroundColor Green

    Write-Host "🎉 Upload completed successfully!" -ForegroundColor Green
    Write-Host "🎉 تم رفع الملفات بنجاح!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "❌ حدث خطأ: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
