import { NextRequest, NextResponse } from 'next/server';
import ChartRepository from '../../../src/api/repositories/chartRepository';
import logger from '../../../src/shared/utils/logger';
import { getAuthWithRole, requireEditOrAdmin } from '../../../src/api/utils/roleAuth';

/**
 * Route API: GET /api/charts
 * Récupère tous les charts (auth requise)
 */
export async function GET(request: NextRequest) {
  try {
    await getAuthWithRole(request.headers);
    const chartRepository = new ChartRepository();
    const result = await chartRepository.getAll();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('charts GET API route', error);
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Session') || msg.includes('authentifié')) {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Route API: POST /api/charts
 * Crée un nouveau chart (edit ou admin)
 */
export async function POST(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    const body = await request.json();
    const chartRepository = new ChartRepository();
    await chartRepository.create(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Session') || msg.includes('authentifié')) {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    if (msg.includes('lecture seule') || msg.includes('Droits')) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
