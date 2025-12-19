
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import { COLUMNS } from '../lib/sheets';

// Load env vars
dotenv.config({ path: '.env.local' });

if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
    console.error('Missing env vars');
    process.exit(1);
}

const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana'];
const JOBS = ['Mühendis', 'Öğretmen', 'Esnaf', 'Memur', 'Diğer', 'Doktor', 'Hemşire'];
const PRODUCTS = ['iPhone 15 Pro', 'Samsung S24', 'MacBook Air', 'iPad Pro', 'Dyson V15'];
const STATUSES = ['Yeni', 'Ulaşılamadı', 'Aranacak', 'Onaya gönderildi', 'Teslim edildi', 'Reddetti', 'Kefil bekleniyor'];
const APPROVALS = ['Beklemede', 'Onaylandı', 'Reddedildi', 'Kefil İstendi'];

function getRandomItem(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

async function seed() {
    console.log('Connecting to Google Sheets...');
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Customers'];

    if (!sheet) {
        console.error('Customers sheet not found');
        return;
    }

    console.log('Generating dummy data...');
    const rows = [];

    for (let i = 0; i < 20; i++) {
        const city = getRandomItem(CITIES);
        const job = getRandomItem(JOBS);
        const status = getRandomItem(STATUSES);
        const product = getRandomItem(PRODUCTS);
        const amount = Math.floor(Math.random() * 50000) + 10000;
        const approval = getRandomItem(APPROVALS);

        // Logic to make data realistic
        let approvalStatus = approval;
        if (status === 'Teslim edildi') approvalStatus = 'Onaylandı';
        if (status === 'Reddetti') approvalStatus = 'Reddedildi';

        const rowData: Record<string, any> = {
            id: crypto.randomUUID(),
            created_at: randomDate(new Date(2024, 0, 1), new Date()),
            ad_soyad: `Test User ${i + 1}`,
            telefon: `555${Math.floor(Math.random() * 10000000)}`,
            sehir: city,
            meslek_is: job,
            son_yatan_maas: (Math.floor(Math.random() * 40000) + 17000).toString(),
            durum: status,
            talep_edilen_urun: product,
            talep_edilen_tutar: amount.toString(),
            onay_durumu: approvalStatus,
            kredi_limiti: approvalStatus === 'Onaylandı' ? (amount + 5000).toString() : '',
            // Guarantor logic
            kefil_ad_soyad: approvalStatus === 'Kefil İstendi' ? 'Kefil Ali' : '',
        };

        // Map to column array based on strictly ordered COLUMNS
        // But GoogleSpreadsheet addRows accepts objects if headers are set? 
        // No, we should use the array format to match our manual logic or just use object with header row support.
        // Let's use array to be safe given our app logic relies on indices mostly.

        // Actually doc.addRows with raw objects works if headers match.
        // Let's verify headers.

        rows.push(rowData);
    }

    // Using addRows with objects matching header values
    // We need to make sure headers in sheet match keys. 
    // They are Turkish/mixed in our COLUMNS definition.
    // Our COLUMNS array keys ARE the headers we expect.

    console.log(`Adding ${rows.length} rows...`);
    // await sheet.addRows(rows); // This assumes headers are set in row 1 matching keys

    // Safer to just append raw values using our helper logic
    const rawRows = rows.map(r => {
        return COLUMNS.map(col => r[col] || '');
    });

    await sheet.addRows(rawRows);
    console.log('Seed complete! Check reports page.');
}

seed().catch(console.error);
