import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getLeads } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Fetch leads owned by current user
        let leads = await getLeads({ sahip: session.user.email });

        // Apply filters
        if (status) {
            leads = leads.filter(l => l.durum === status);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            leads = leads.filter(l =>
                l.ad_soyad?.toLowerCase().includes(searchLower) ||
                l.telefon?.includes(search)
            );
        }

        // Sort by most recent first
        leads.sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at).getTime();
            const dateB = new Date(b.updated_at || b.created_at).getTime();
            return dateB - dateA;
        });

        return NextResponse.json({ leads });
    } catch (error: any) {
        console.error('My leads fetch error:', error);
        return NextResponse.json(
            { message: error.message || 'Error fetching leads' },
            { status: 500 }
        );
    }
}
