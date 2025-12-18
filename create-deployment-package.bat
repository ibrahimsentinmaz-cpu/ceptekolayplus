@echo off
chcp 65001 >nul
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║     Deployment Package Oluşturuluyor...                       ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

set TEMP_DIR=fiyat_hesaplama_uygulamasi_deploy
set OUTPUT_ZIP=fiyat_hesaplama_uygulamasi_deploy.zip

echo [1/4] Geçici klasör oluşturuluyor...
if exist %TEMP_DIR% rd /s /q %TEMP_DIR%
mkdir %TEMP_DIR%
echo ✅ Geçici klasör hazır
echo.

echo [2/4] Gerekli dosyalar kopyalanıyor...

REM Kaynak kod klasörleri
xcopy /E /I /Q src %TEMP_DIR%\src
xcopy /E /I /Q public %TEMP_DIR%\public

REM Konfigurasyon dosyaları
copy package.json %TEMP_DIR%\ >nul
copy package-lock.json %TEMP_DIR%\ >nul
copy tsconfig.json %TEMP_DIR%\ >nul
copy next.config.ts %TEMP_DIR%\ >nul
copy postcss.config.js %TEMP_DIR%\ >nul
if exist tailwind.config.ts copy tailwind.config.ts %TEMP_DIR%\ >nul

REM Environment dosyaları
copy .env.example %TEMP_DIR%\ >nul
if exist .env.local copy .env.local %TEMP_DIR%\ >nul

REM Setup scriptleri
copy setup.bat %TEMP_DIR%\ >nul
copy setup.sh %TEMP_DIR%\ >nul

REM Dokümantasyon
copy README.md %TEMP_DIR%\ >nul
if exist .gitignore copy .gitignore %TEMP_DIR%\ >nul

echo ✅ Dosyalar kopyalandı
echo.

echo [3/4] ZIP dosyası oluşturuluyor...

REM PowerShell ile ZIP oluştur
powershell -command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%OUTPUT_ZIP%' -Force"

if %errorlevel% equ 0 (
    echo ✅ ZIP dosyası oluşturuldu: %OUTPUT_ZIP%
) else (
    echo ❌ ZIP oluşturulamadı! PowerShell 5.0+ gerekli.
    echo.
    echo Alternatif: %TEMP_DIR% klasörünü manuel olarak ZIP yapın.
    pause
    exit /b 1
)
echo.

echo [4/4] Temizlik...
rd /s /q %TEMP_DIR%
echo ✅ Geçici klasör silindi
echo.

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    ✅ HAZIR!                                   ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo ZIP Dosyası: %OUTPUT_ZIP%
echo Boyut: 
for %%A in (%OUTPUT_ZIP%) do echo %%~zA bytes
echo.
echo Bu dosyayı diğer bilgisayara kopyalayın.
echo.
echo Diğer PC'de:
echo   1. ZIP'i çıkarın
echo   2. setup.bat çalıştırın
echo   3. .env.local düzenleyin (varsa)
echo   4. npm run dev
echo.
pause
