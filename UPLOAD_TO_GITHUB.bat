@echo off
echo ========================================
echo  Uploading Dazzle Jewelry to GitHub
echo ========================================
echo.

REM Step 1: Initialize Git
echo [1/6] Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo Error: Git initialization failed
    pause
    exit /b 1
)
echo Done!
echo.

REM Step 2: Add all files
echo [2/6] Adding files to Git...
git add .
if %errorlevel% neq 0 (
    echo Error: Failed to add files
    pause
    exit /b 1
)
echo Done!
echo.

REM Step 3: Check what will be uploaded
echo [3/6] Files to be uploaded:
git status --short
echo.
echo NOTE: .env.local and .sql files should NOT appear above
echo.
pause

REM Step 4: Commit
echo [4/6] Committing files...
git commit -m "Initial commit - Dazzle Jewelry Store"
if %errorlevel% neq 0 (
    echo Error: Commit failed
    pause
    exit /b 1
)
echo Done!
echo.

REM Step 5: Add remote (you need to replace this URL)
echo [5/6] Adding GitHub remote...
echo.
echo IMPORTANT: Replace YOUR-USERNAME with your actual GitHub username
echo Example: https://github.com/john123/dazzle-jewelry.git
echo.
set /p REPO_URL="Enter your GitHub repository URL: "

git remote add origin %REPO_URL%
if %errorlevel% neq 0 (
    echo Warning: Remote might already exist, trying to set URL...
    git remote set-url origin %REPO_URL%
)
echo Done!
echo.

REM Step 6: Push to GitHub
echo [6/6] Pushing to GitHub...
git branch -M main
git push -u origin main
if %errorlevel% neq 0 (
    echo Error: Push failed. Make sure:
    echo 1. You created the repository on GitHub
    echo 2. You have Git credentials configured
    echo 3. The repository URL is correct
    pause
    exit /b 1
)
echo.
echo ========================================
echo  SUCCESS! Project uploaded to GitHub
echo ========================================
echo.
echo Next steps:
echo 1. Go to vercel.com
echo 2. Sign in with GitHub
echo 3. Import your repository
echo 4. Deploy!
echo.
pause
