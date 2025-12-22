import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateLead, getLeads } from '@/lib/sheets';
import { Customer } from '@/lib/types';
import { sendStatusEmail } from '@/lib/email-service';

export async function PUT(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body: Customer = await req.json();

        // Check if status changed
        const leads = await getLeads();
        const existing = leads.find(l => l.id === params.id);

        // Update the lead
        const updated = await updateLead(body, session.user.email);

        // Send email if status changed
        if (existing && existing.durum !== updated.durum) {
            await sendStatusEmail(updated, updated.durum);
        } else if (existing && existing.onay_durumu !== updated.onay_durumu) {
            // Handle explicit Guarantor request via status property if mapped
            if (updated.onay_durumu === 'Kefil İstendi') {
                await sendStatusEmail(updated, 'Kefil İstendi');
            }
        }

        return NextResponse.json({ lead: updated });
    } catch (error: any) {
        console.error('Update error:', error);
        return NextResponse.json(
            { message: error.message || 'Update failed' },
            { status: 500 }
        );
    }
}
