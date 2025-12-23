import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/google';
import { COLUMNS } from '@/lib/sheets';
import { Customer } from '@/lib/types';

export const dynamic = 'force-dynamic';

function rowToCustomer(row: any[]): Customer {
    const c: any = {};
    COLUMNS.forEach((col, idx) => {
        c[col] = row[idx] || undefined;
    });
    return c as Customer;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dateFilter = searchParams.get('date'); // YYYY-MM-DD

        const client = getSheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID;

        // Fetch all customers (optimization: could filter in sheets query if simplified, but full fetch is safer for consistent object mapping)
        const response = await client.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Customers!A2:ZZ',
        });

        const rows = response.data.values || [];

        let deliveredCustomers = rows
            .map(row => rowToCustomer(row))
            // 1. Filter by Status 'Teslim edildi'
            .filter(c => c.durum === 'Teslim edildi');

        // 2. Filter by Date if provided
        if (dateFilter) {
            deliveredCustomers = deliveredCustomers.filter(c => {
                // Check 'teslim_tarihi' first, fallback to 'updated_at'
                const dateStr = c.teslim_tarihi || c.updated_at;
                if (!dateStr) return false;

                // Format: YYYY-MM-DD
                // dateStr might be ISO (2024-01-01T...) or just YYYY-MM-DD
                return dateStr.startsWith(dateFilter);
            });
        }

        // 3. Sort by delivery date (newest first)
        deliveredCustomers.sort((a, b) => {
            const dateA = new Date(a.teslim_tarihi || a.updated_at || 0).getTime();
            const dateB = new Date(b.teslim_tarihi || b.updated_at || 0).getTime();
            return dateB - dateA;
        });

        return NextResponse.json({
            success: true,
            count: deliveredCustomers.length,
            customers: deliveredCustomers
        });

    } catch (error: any) {
        console.error('Error fetching delivery report:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
