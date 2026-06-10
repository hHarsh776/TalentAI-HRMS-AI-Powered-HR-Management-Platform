@echo off
echo ========================================================
echo   Welcome back! TalentAI Deployment Script 
echo ========================================================
echo.
echo I have already:
echo 1. Installed the Vercel CLI
echo 2. Configured your environment variables in the code
echo 3. Verified the production build has zero errors
echo.
echo Now we will deploy to Vercel. 
echo A browser window may open asking you to log into Vercel.
echo Please log in, and follow the prompts in this terminal.
echo.
echo Press any key to start the deployment...
pause >nul

cd /d "%~dp0"
vercel

echo.
echo If the deployment was successful, your project is now live!
pause
