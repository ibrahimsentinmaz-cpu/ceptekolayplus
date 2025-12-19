import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/google';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
    try {
        const { customerId } = await params;
        if (!customerId) {
            return NextResponse.json({ success: false, message: 'Customer ID required' }, { status: 400 });
        }

        const client = getSheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID;

        const response = await client.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Logs!A2:H', // A: log_id, B: timestamp, C: user, D: cust_id, E: action, F: old, G: new, H: note
        });

        const rows = response.data.values || [];

        // Filter logs for this customer
        // Column Index 3 (D) is customer_id (0-indexed)
        const customerLogs = rows
            .filter(row => row[3] === customerId)
            .map(row => ({
                log_id: row[0],
                timestamp: row[1],
                user_email: row[2],
                action: row[4],
                old_value: row[5],
                new_value: row[6],
                note: row[7]
            }))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // CSS Sort Descending

        return NextResponse.json({ success: true, logs: customerLogs });

    } catch (error: any) {
        console.error('Logs API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
