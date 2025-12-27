import { NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/google';
import { COLUMNS } from '@/lib/sheets';
import { parse, isValid } from 'date-fns';

export const dynamic = 'force-dynamic';

function parseSheetDateDebug(dateStr: string | undefined): { parsed: number | null, reason: string } {
    if (!dateStr || !dateStr.trim()) return { parsed: null, reason: 'Empty/Null' };
    const cleanStr = dateStr.trim();

    // 1. Try standard JS Date
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) return { parsed: d.getTime(), reason: 'Standard Date' };

    // 2. Try date-fns formats
    const formats = [
        'dd.MM.yyyy HH:mm:ss',
        'dd.MM.yyyy HH:mm',
        'dd.MM.yyyy',
        'dd/MM/yyyy HH:mm:ss',
        'dd/MM/yyyy HH:mm',
        'dd/MM/yyyy',
        'dd-MM-yyyy HH:mm:ss',
        'dd-MM-yyyy HH:mm',
        'dd-MM-yyyy',
        'yyyy-MM-dd HH:mm:ss',
        'yyyy-MM-dd'
    ];

    const now = new Date();
    for (const fmt of formats) {
        const parsed = parse(cleanStr, fmt, now);
        if (isValid(parsed)) return { parsed: parsed.getTime(), reason: `Matched Format: ${fmt}` };
    }

    return { parsed: null, reason: 'Failed all formats' };
}

export async function GET() {
    try {
        const client = getSheetsClient();
        const response = await client.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Customers!A2:Z100', // Fetch first 100 rows, limited columns
        });

        const rows = response.data.values || [];
        const sonAramaIndex = COLUMNS.indexOf('son_arama_zamani');

        const trFormatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Istanbul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const todayStr = trFormatter.format(new Date());

        const debugLog = rows.map((row, i) => {
            const raw = row[sonAramaIndex];
            const result = parseSheetDateDebug(raw);

            let hour = null;
            let dateStr = null;
            let isToday = false;

            if (result.parsed) {
                const d = new Date(result.parsed);
                // Logic from sheets.ts
                dateStr = trFormatter.format(d);
                isToday = dateStr === todayStr;

                const hourStr = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Europe/Istanbul',
                    hour: 'numeric',
                    hour12: false
                }).format(d);
                hour = parseInt(hourStr, 10);
            }

            return {
                row: i + 2,
                raw_value: raw,
                parsed_timestamp: result.parsed,
                logic_check: {
                    system_today: todayStr,
                    row_date: dateStr,
                    is_today: isToday,
                    extracted_hour: hour
                },
                reason: result.reason
            };
        }).filter(item => item.raw_value); // Only show rows with data

        return NextResponse.json({
            column_index: sonAramaIndex,
            total_rows_scanned: rows.length,
            debug_log: debugLog
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
