import { NextRequest, NextResponse } from 'next/server';
import exportDataUseCase from '../../../../src/api/core/useCases/exportDataUseCase';
import logger from '../../../../src/shared/utils/logger';
import { requireEditOrAdmin } from '../../../../src/api/utils/roleAuth';

/**
 * Route API: GET /api/settings/export
 * Exporte les données de l'application (edit ou admin)
 */
export async function GET(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    const result = await exportDataUseCase.execute();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('settings/export GET API route', error);
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
