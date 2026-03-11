import { NextRequest, NextResponse } from 'next/server';
import { queryProxyUseCase } from '../../../src/api/core/useCases/queryProxyUseCase';
import logger from '../../../src/shared/utils/logger';
import { getAuthWithRole } from '../../../src/api/utils/roleAuth';

/**
 * Route API: POST /api/query-proxy
 * Proxy pour requêtes SQL externes (auth requise)
 */
export async function POST(request: NextRequest) {
  try {
    await getAuthWithRole(request.headers);
    const body = await request.json();
    const { connectionId, query } = body;

    if (!connectionId || !query) {
      return NextResponse.json(
        { error: 'connectionId et query sont requis' },
        { status: 400 }
      );
    }

    const result = await queryProxyUseCase.execute({ connectionId, query });
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('query-proxy POST API route', error);
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Session') || msg.includes('authentifié')) {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
