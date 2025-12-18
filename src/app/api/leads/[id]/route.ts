import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateLead } from '@/lib/sheets';
import { Customer } from '@/lib/types';

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

        // Update the lead
        const updated = await updateLead(body, session.user.email);

        return NextResponse.json({ lead: updated });
    } catch (error: any) {
        console.error('Update error:', error);
        return NextResponse.json(
            { message: error.message || 'Update failed' },
            { status: 500 }
        );
    }
}
