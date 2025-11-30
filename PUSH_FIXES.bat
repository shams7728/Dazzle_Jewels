@echo off
echo ========================================
echo  Pushing Next.js 16 Fixes to GitHub
echo ========================================
echo.

echo Adding fixed files...
git add src/app/api/admin/orders/[id]/tracking/route.ts
git add src/app/api/orders/[id]/cancel/route.ts
git add src/app/api/admin/reports/[jobId]/route.ts

echo.
echo Committing changes...
git commit -m "Fix: Update API routes for Next.js 16 async params"

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
