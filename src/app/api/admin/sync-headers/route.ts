
import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/google';
import { COLUMNS } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const client = getSheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID;

        // 1. Fetch current headers to check (Optional, but good for logging)
        // 2. Overwrite A1:AZ1 with the master COLUMNS list from code

        // We just blindly update for now to ensure consistency

        await client.spreadsheets.values.update({
            spreadsheetId: sheetId!,
            range: 'Customers!A1:ZZ1', // Row 1 is headers
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [COLUMNS as any] // Cast to avoid const tuple type issue
            }
        });

        return NextResponse.json({
            success: true,
            message: `Headers synchronized successfully. Total columns: ${COLUMNS.length}`
        });

    } catch (error: any) {
        console.error('Sync Headers Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
