import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDcortexClient } from '@/lib/dcortexClient';
import { errorResponse } from '@/lib/api-errors';

// Session-gated, request-parameterised read. Never statically renderable.
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getDcortexClient(session);
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'all';

    const findings = await client.getClashes({ scope });
    return NextResponse.json(findings);
  } catch (err) {
    return errorResponse(err, request, { status: 502, message: 'Failed to fetch clash findings' });
  }
}
