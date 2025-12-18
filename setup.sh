#!/bin/bash

# Lead Management System - Otomatik Kurulum (Linux/Mac)

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     Lead Management System - Otomatik Kurulum                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Node.js kontrolü
echo "[1/5] Node.js Kontrolü..."
if ! command -v node &> /dev/null; then
    echo "❌ HATA: Node.js bulunamadı!"
    echo ""
    echo "Lütfen Node.js'i yükleyin: https://nodejs.org"
    echo "Önerilen sürüm: 18.x veya üzeri"
    exit 1
fi
node --version
echo "✅ Node.js bulundu"
echo ""

# npm kontrolü
echo "[2/5] npm Kontrolü..."
if ! command -v npm &> /dev/null; then
    echo "❌ HATA: npm bulunamadı!"
    exit 1
fi
echo "✅ npm bulundu"
echo ""

# Bağımlılıkları yükle
echo "[3/5] Bağımlılıklar yükleniyor (Bu 1-2 dakika sürebilir)..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ HATA: Bağımlılıklar yüklenemedi!"
    exit 1
fi
echo "✅ Bağımlılıklar yüklendi"
echo ""

# .env.local kontrolü
echo "[4/5] Environment dosyası kontrolü..."
if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        echo "⚠️  .env.local bulunamadı, .env.example'dan oluşturuluyor..."
        cp .env.example .env.local
        echo "✅ .env.local oluşturuldu"
        echo ""
        echo "⚠️  ÖNEMLİ: .env.local dosyasını düzenlemeniz gerekiyor!"
        echo "   Dosyayı bir metin editörü ile açıp şu değerleri girin:"
        echo "   - Google OAuth bilgileri"
        echo "   - Service Account bilgileri"
        echo "   - Google Sheet ID"
        echo ""
        echo "Detaylar için KURULUM_REHBERI.md dosyasına bakın."
        echo ""
    else
        echo "❌ HATA: .env.example bulunamadı!"
        exit 1
    fi
else
    echo "✅ .env.local mevcut"
fi
echo ""

# Build klasörünü temizle
echo "[5/5] Build klasörü temizleniyor..."
if [ -d .next ]; then
    rm -rf .next
    echo "✅ .next klasörü temizlendi"
else
    echo "ℹ️  .next klasörü zaten mevcut değil"
fi
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ KURULUM TAMAMLANDI!                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Uygulamayı başlatmak için:"
echo ""
echo "  npm run dev"
echo ""
echo "Tarayıcıda şu adresi açın: http://localhost:3000"
echo ""
echo "⚠️  İlk kurulumda .env.local dosyasını düzenlemeyi unutmayın!"
echo ""
