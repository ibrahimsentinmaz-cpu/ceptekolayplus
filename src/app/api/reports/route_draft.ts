
import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/google';
import { Customer } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const client = getSheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID;

        // 1. Fetch Customers
        const response = await client.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Customers!A2:AZ',
        });

        const rows = response.data.values || [];

        // 2. Process Statistics
        const stats = {
            city: {} as Record<string, number>,
            profession: {} as Record<string, { count: number, totalIncome: number }>,
            product: {} as Record<string, number>,
            rejection: {} as Record<string, number>,
            funnel: {
                total: rows.length,
                contacted: 0,
                storeVisit: 0,
                sale: 0,
            }
        };

        rows.forEach(row => {
            // Simplified logic (mapping indices based on sheets.ts knowledge)
            // Assumes headers are consistent, ideally we map based on header row in a real robust app
            // For now we use the known schema structure
            // Index mappings need to be precise.
            // Let's rely on string matching for 'status' column which is index 9 (approx)
            // We'll trust the helper or do simple column counting if needed.
            // BETTER: Use a helper to map row to object, then aggregate.
        });

        return NextResponse.json({ success: true, stats });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
