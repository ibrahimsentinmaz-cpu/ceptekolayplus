import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getSheetsClient } from '@/lib/google';
import { Customer } from '@/lib/types';
import { randomUUID } from 'crypto';

async function seedData() {
    const client = getSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID;

    console.log('Test verileri hazırlanıyor...');

    const now = new Date();
    const pastHour = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const futureHour = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // Mapping based on columns in sheets.ts
    // 'id', 'created_at', 'created_by', 'ad_soyad', 'telefon', ... 'durum' ... 'sonraki_arama_zamani'

    // Helper to create row array matching columns
    const createRow = (d: Partial<Customer>) => {
        const fullData: Customer = {
            id: randomUUID(),
            created_at: new Date().toISOString(),
            created_by: 'seed-script',
            ad_soyad: 'Test User',
            telefon: '5550000000',
            durum: 'Yeni',
            ...d
        } as Customer;

        // Same order as sheets.ts COLUMNS
        return [
            fullData.id, fullData.created_at, fullData.created_by, fullData.ad_soyad, fullData.telefon,
            fullData.tc_kimlik || '', fullData.dogum_tarihi || '', fullData.sehir || 'İstanbul',
            fullData.meslek_is || '', fullData.mulkiyet_durumu || '',
            fullData.durum,
            fullData.sahip || '',
            fullData.cekilme_zamani || '',
            fullData.son_arama_zamani || '',
            fullData.sonraki_arama_zamani || '',
            fullData.arama_not_kisa || '',
            fullData.aciklama_uzun || '',
            // ... lots of empty fields, let's keep it simple and just map keys if possible or hardcode small set
            // The sheet expects 38 columns. Let's fill basics.
        ];
    };

    // We need 38 columns to avoid shifting issues if we use append with specific logic
    // But append usually just adds to the next available row. 
    // Let's rely on the fact that we just need the first ~11 columns for basic display + status logic.

    const samples = [
        // 1. Acil (Randevusu gelmiş)
        {
            ad_soyad: 'Ahmet Acil (Randevulu)',
            telefon: '5321000001',
            durum: 'Sonra Aranacak',
            sonraki_arama_zamani: pastHour // Should be top priority
        },
        // 2. Yeni 1
        {
            ad_soyad: 'Mehmet Yeni (Sıcak)',
            telefon: '5321000002',
            durum: 'Yeni'
        },
        // 3. Tekrar Dene (2 gün önce aranmış)
        {
            ad_soyad: 'Ayşe Tekrar (Ulaşılamadı)',
            telefon: '5321000003',
            durum: 'Ulaşılamadı',
            son_arama_zamani: yesterday
        },
        // 4. Yeni 2
        {
            ad_soyad: 'Fatma Yeni (Soğuk)',
            telefon: '5321000004',
            durum: 'Yeni'
        },
        // 5. Henüz vakti gelmemiş randevu (Gözükmemeli veya en son)
        {
            ad_soyad: 'Ali İleri Tarih',
            telefon: '5321000005',
            durum: 'Sonra Aranacak',
            sonraki_arama_zamani: futureHour
        }
    ];

    const values = samples.map(s => {
        // Construct array with correct index for critical fields
        // 0:id, 3:name, 4:phone, 10:status, 13:last_call, 14:next_call
        const row = new Array(38).fill('');
        row[0] = randomUUID();
        row[1] = new Date().toISOString();
        row[2] = 'SYSTEM';
        row[3] = s.ad_soyad;
        row[4] = s.telefon;
        row[7] = 'Ankara';
        row[10] = s.durum;
        if (s.son_arama_zamani) row[13] = s.son_arama_zamani;
        if (s.sonraki_arama_zamani) row[14] = s.sonraki_arama_zamani;
        return row;
    });

    try {
        await client.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Customers!A:AL',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
        });
        console.log('✅ 5 adet test müşterisi eklendi.');
    } catch (e: any) {
        console.error('Hata:', e.message);
    }
}

seedData();
