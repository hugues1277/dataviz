import { NextRequest, NextResponse } from 'next/server';
import clearAllDatasUseCase from '../../../../src/api/core/useCases/clearAllDatasUseCase';
import logger from '../../../../src/shared/utils/logger';
import { requireEditOrAdmin } from '../../../../src/api/utils/roleAuth';

/**
 * Route API: POST /api/settings/clear
 * Supprime toutes les données de l'application (edit ou admin)
 */
export async function POST(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    await clearAllDatasUseCase.execute();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logger.error('settings/clear POST API route', error);
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Session') || msg.includes('authentifié')) {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    if (msg.includes('lecture seule') || msg.includes('Droits')) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
