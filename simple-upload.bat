@echo off
echo Starting upload...

git config --global user.name "Yalenzi"
git config --global user.email "ararsmomarar@gmail.com"

git init
git remote remove origin
git remote add origin https://github.com/Yalenzi/colorstrsts.git
git add .
git commit -m "Fix useAuth build errors with safe-providers"
git push -u origin main

echo Upload completed!
pause
