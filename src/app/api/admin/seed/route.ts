
import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/google';
import { COLUMNS } from '@/lib/sheets';

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

export async function GET(req: NextRequest) {
    // Basic security: only allow in development or if a secret is passed
    // For now, just development convenience

    try {
        const client = getSheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID;

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

            const rowData: any = {
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
            const rowValues = COLUMNS.map(col => rowData[col] || '');
            rows.push(rowValues);
        }

        await client.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Customers!A:AZ',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: rows }
        });

        return NextResponse.json({ success: true, message: `Added ${rows.length} test leads.` });

    } catch (error: any) {
        console.error('Seed Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
