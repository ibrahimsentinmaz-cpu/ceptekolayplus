import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/google';

export const dynamic = 'force-dynamic';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function GET(req: NextRequest) {
    try {
        const client = getSheetsClient();
        const response = await client.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'Customers!A1:ZZ5', // Fetch header + first 4 rows
        });

        const rows = response.data.values || [];

        return NextResponse.json({
            message: 'Debug Info',
            rowsFetched: rows.length,
            header: rows[0],
            firstRow: rows[1] ? rows[1] : 'No data row',
            envSheetId: SHEET_ID ? 'Exists' : 'Missing',
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
