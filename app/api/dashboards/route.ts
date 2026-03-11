import { NextRequest, NextResponse } from 'next/server';
import DashboardRepository from '../../../src/api/repositories/dashboardRepository';
import logger from '../../../src/shared/utils/logger';
import { getAuthWithRole } from '../../../src/api/utils/roleAuth';
import { requireEditOrAdmin } from '../../../src/api/utils/roleAuth';

/**
 * Route API: GET /api/dashboards
 * Récupère tous les dashboards (auth requise)
 */
export async function GET(request: NextRequest) {
  try {
    await getAuthWithRole(request.headers);
    const dashboardRepository = new DashboardRepository();
    const dashboards = await dashboardRepository.getAll();
    return NextResponse.json(dashboards, { status: 200 });
  } catch (error: unknown) {
    logger.error('dashboards GET API route', error);
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Session') || msg.includes('authentifié')) {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Route API: POST /api/dashboards
 * Crée un nouveau dashboard (edit ou admin)
 */
export async function POST(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    const body = await request.json();
    const dashboardRepository = new DashboardRepository();
    await dashboardRepository.create(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error: unknown) {
    logger.error('dashboards POST API route', error);
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
