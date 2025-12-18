@echo off
chcp 65001 >nul
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║     Lead Management System - Otomatik Kurulum                 ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo [1/5] Node.js Kontrolü...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ HATA: Node.js bulunamadı!
    echo.
    echo Lütfen Node.js'i yükleyin: https://nodejs.org
    echo Önerilen sürüm: 18.x veya üzeri
    pause
    exit /b 1
)

node --version
echo ✅ Node.js bulundu
echo.

echo [2/5] npm Kontrolü...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ HATA: npm bulunamadı!
    pause
    exit /b 1
)
echo ✅ npm bulundu
echo.

echo [3/5] Bağımlılıklar yükleniyor (Bu 1-2 dakika sürebilir)...
call npm install
if %errorlevel% neq 0 (
    echo ❌ HATA: Bağımlılıklar yüklenemedi!
    pause
    exit /b 1
)
echo ✅ Bağımlılıklar yüklendi
echo.

echo [4/5] Environment dosyası kontrolü...
if not exist .env.local (
    if exist .env.example (
        echo ⚠️  .env.local bulunamadı, .env.example'dan oluşturuluyor...
        copy .env.example .env.local >nul
        echo ✅ .env.local oluşturuldu
        echo.
        echo ⚠️  ÖNEMLİ: .env.local dosyasını düzenlemeniz gerekiyor!
        echo    Dosyayı bir metin editörü ile açıp şu değerleri girin:
        echo    - Google OAuth bilgileri
        echo    - Service Account bilgileri  
        echo    - Google Sheet ID
        echo.
        echo Detaylar için KURULUM_REHBERI.md dosyasına bakın.
        echo.
    ) else (
        echo ❌ HATA: .env.example bulunamadı!
        pause
        exit /b 1
    )
) else (
    echo ✅ .env.local mevcut
)
echo.

echo [5/5] Build klasörü temizleniyor...
if exist .next (
    rd /s /q .next
    echo ✅ .next klasörü temizlendi
) else (
    echo ℹ️  .next klasörü zaten mevcut değil
)
echo.

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    ✅ KURULUM TAMAMLANDI!                     ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Uygulamayı başlatmak için:
echo.
echo   npm run dev
echo.
echo Tarayıcıda şu adresi açın: http://localhost:3000
echo.
echo ⚠️  İlk kurulumda .env.local dosyasını düzenlemeyi unutmayın!
echo.
pause
