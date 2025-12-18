import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getSheetsClient, getGoogleAuth } from '@/lib/google';

async function checkSheet() {
    console.log('--- Env Kontrol ---');
    console.log('Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID);
    console.log('Key Length:', process.env.GOOGLE_PRIVATE_KEY?.length);
    console.log('Key Start:', process.env.GOOGLE_PRIVATE_KEY?.substring(0, 20));
    console.log('-------------------');

    try {
        console.log('1. Kimlik doğrulama testi yapılıyor...');
        const auth = getGoogleAuth();
        const clientAuth = await auth.getClient();
        console.log('   [BAŞARILI] Kimlik doğrulama sağlandı (Service Account).');

        const client = getSheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID;

        console.log('2. Sheet bağlantısı test ediliyor (Sheet ID:', sheetId, ')...');

        // Test Users sheet
        const usersRes = await client.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Users!A1:C10',
        });

        console.log('2. Users tablosundan okunan veriler:');
        const rows = usersRes.data.values;
        if (!rows || rows.length === 0) {
            console.log('   [UYARI] Users tablosu tamamen BOŞ veya okunamadı.');
        } else {
            rows.forEach((row, i) => {
                console.log(`   Satır ${i + 1}: ${JSON.stringify(row)}`);
            });
        }

    } catch (error: any) {
        console.error('\n[HATA] Google Sheets erişimi başarısız!');
        console.error('Hata Detayı:', error.message);

        if (error.message.includes('403') || error.message.includes('permission')) {
            console.log('\n--- ÇÖZÜM ---');
            console.log('Service Account email adresini Sheet dosyasında "Editör" olarak yetkilendirmemiş olabilirsiniz.');
            console.log('Lütfen şu adrese yetki verin: sales-app@saharapor.iam.gserviceaccount.com');
        }
    }
}

checkSheet();
