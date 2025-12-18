# Lead Management System

Telefon satış ekibi için müşteri adayı yönetim ve onay sistemi.

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env.local
# .env.local dosyasını düzenle

# Uygulamayı başlat
npm run dev
```

Tarayıcıda `http://localhost:3000` açın.

## 📚 Detaylı Kurulum

Adım adım kurulum için [KURULUM_REHBERI.md](./KURULUM_REHBERI.md) dosyasına bakın.

## ✨ Özellikler

- 🔐 Google OAuth ile güvenli giriş
- 📊 Akıllı müşteri çekme (Randevulu → Yeni → Tekrar Ara)
- ✅ Admin onay sistemi
- 📦 Teslimat takibi (Seri No/IMEI)
- 📝 Detaylı müşteri bilgi formu
- 🔄 Real-time Google Sheets entegrasyonu

## 🛠️ Teknolojiler

- **Framework:** Next.js 15 (App Router)
- **Stil:** Tailwind CSS v4
- **Auth:** NextAuth.js
- **Database:** Google Sheets
- **Language:** TypeScript

## 📖 Kullanım

### Satış Temsilcisi
1. Google ile giriş yap
2. "Yeni Müşteri Çek" ile müşteri al
3. Bilgileri doldur
4. "Başvuru alındı" olarak işaretle
5. "Benim Müşterilerim" den takip et

### Yönetici
1. "Onay Paneli" sekmesine git
2. Başvuruları incele
3. Onayla/Reddet/Kefil İste
4. Onaylanan müşteriler teslimat için hazır

## 🔧 Scripts

```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Production server
npm run lint      # ESLint
```

## 📝 Lisans

Şirket içi kullanım için geliştirilmiştir.
