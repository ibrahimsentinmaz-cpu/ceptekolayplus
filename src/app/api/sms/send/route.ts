
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendSMS } from '@/lib/sms';
import { logAction } from '@/lib/sheets';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { customerId, phone, message } = body;

        if (!phone || !message) {
            return NextResponse.json({ message: 'Phone and message are required' }, { status: 400 });
        }

        const sent = await sendSMS(phone, message);

        if (sent) {
            // Log it
            if (customerId) {
                await logAction({
                    log_id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    user_email: session.user.email,
                    customer_id: customerId,
                    action: 'SEND_SMS',
                    note: 'Manuel Gönderim',
                    new_value: message
                });
            }
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: 'NetGSM Provider Error' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Manual SMS Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
