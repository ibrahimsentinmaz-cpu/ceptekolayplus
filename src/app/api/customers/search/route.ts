import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/google';
import { COLUMNS } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || searchParams.get('tc');

        if (!query || query.length < 2) {
            return NextResponse.json({ success: false, message: 'En az 2 karakter giriniz.' }, { status: 400 });
        }

        const client = getSheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID;

        // Fetch all data
        // OPTIMIZATION: For large datasets, this might be slow. 
        // But for <5000 rows it's okay.
        const response = await client.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Customers!A2:ZZ',
        });

        const rows = response.data.values || [];
        const lowerQuery = query.toLowerCase();

        // Indices
        const idxTC = COLUMNS.indexOf('tc_kimlik');
        const idxName = COLUMNS.indexOf('ad_soyad');
        const idxPhone = COLUMNS.indexOf('telefon');

        // Helper to extract customer object
        const mapRowToCustomer = (row: any[]) => {
            const c: any = {};
            COLUMNS.forEach((col, i) => c[col] = row[i] || null);
            return c;
        };

        const matches = rows.filter(row => {
            const tc = row[idxTC]?.toString() || '';
            const name = row[idxName]?.toString().toLowerCase() || '';
            const phone = row[idxPhone]?.toString().replace(/\D/g, '') || '';
            const queryClean = lowerQuery.replace(/\D/g, ''); // For phone/tc checks

            // 1. TC Check (Exact or partial if long enough)
            if (tc.includes(queryClean) && queryClean.length > 5) return true;

            // 2. Phone Check
            // Check if query is numeric and matches phone
            if (queryClean.length > 5 && phone.includes(queryClean)) return true;

            // 3. Name Check
            if (name.includes(lowerQuery)) return true;

            return false;
        }).map(mapRowToCustomer);

        if (matches.length === 0) {
            return NextResponse.json({ success: true, found: false, message: 'Kayıt bulunamadı.', customers: [] });
        }

        return NextResponse.json({
            success: true,
            found: true,
            count: matches.length,
            customers: matches
        });

    } catch (error: any) {
        console.error('Search API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
