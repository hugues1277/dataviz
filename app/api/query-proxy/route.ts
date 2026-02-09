import { NextRequest, NextResponse } from 'next/server';
import { queryProxyUseCase } from '../../../src/api/core/useCases/queryProxyUseCase';
import logger from '../../../src/shared/utils/logger';

/**
 * Route API: POST /api/query-proxy
 * Proxy pour requêtes SQL externes
 * Basée sur apiPlugin.ts
 */
export async function POST(request: NextRequest) {
  try {
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
}
