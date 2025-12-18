import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getLeads } from '@/lib/sheets';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Forbidden - Admin only' }, { status: 403 });
    }

    try {
        // Fetch all leads with "Başvuru alındı" status
        const leads = await getLeads({ durum: 'Başvuru alındı' });

        // Sort by creation date (oldest first for FIFO)
        leads.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateA - dateB;
        });

        console.log(`Found ${leads.length} pending approvals`);
        if (leads.length > 0) {
            console.log('First lead sample:', { id: leads[0].id, ad_soyad: leads[0].ad_soyad });
        }

        return NextResponse.json({ leads });
    } catch (error: any) {
        console.error('Pending approvals fetch error:', error);
        return NextResponse.json(
            { message: error.message || 'Error fetching pending approvals' },
            { status: 500 }
        );
    }
}
