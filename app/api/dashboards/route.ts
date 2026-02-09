import { NextRequest, NextResponse } from 'next/server';
import DashboardRepository from '../../../src/api/repositories/dashboardRepository';
import logger from '../../../src/shared/utils/logger';

/**
 * Route API: GET /api/dashboards
 * Récupère tous les dashboards
 * Basée sur apiPlugin.ts
 */
export async function GET() {
  try {
    const dashboardRepository = new DashboardRepository();
    await dashboardRepository.getAll();
    return NextResponse.json(null, { status: 200 });
  } catch (error: unknown) {
    logger.error('dashboards GET API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * Route API: POST /api/dashboards
 * Crée un nouveau dashboard
 * Basée sur apiPlugin.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dashboardRepository = new DashboardRepository();
    await dashboardRepository.create(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error: unknown) {
    logger.error('dashboards POST API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
}
