@echo off
echo ========================================
echo  Pushing Next.js 16 Fixes to GitHub
echo ========================================
echo.

echo Adding all fixed files...
git add .

echo.
echo Committing changes...
git commit -m "Fix: Update for Next.js 16 compatibility (async params + GSAP types)"

echo.
echo Pushing to GitHub...
git push

echo.
echo ========================================
echo  Done! Vercel will auto-deploy
echo ========================================
echo.
echo Wait 2-3 minutes for Vercel to rebuild
pause
