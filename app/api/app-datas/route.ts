import { NextRequest, NextResponse } from 'next/server';
import { getAppDatasUseCase } from '../../../src/api/core/useCases/getAppDatasUseCase';
import logger from '../../../src/shared/utils/logger';
import { getAuthWithRole } from '../../../src/api/utils/roleAuth';

/**
 * Route API: GET /api/app-datas
 * Récupère toutes les données de l'application (auth requise)
 */
export async function GET(request: NextRequest) {
  try {
    await getAuthWithRole(request.headers);
    const result = await getAppDatasUseCase.execute();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('app-datas API route', error);
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Session') || msg.includes('authentifié')) {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
