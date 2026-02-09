import { NextRequest, NextResponse } from 'next/server';
import ChartRepository from '../../../src/api/repositories/chartRepository';
import logger from '../../../src/shared/utils/logger';

/**
 * Route API: GET /api/charts
 * Récupère tous les charts
 * Basée sur apiPlugin.ts
 */
export async function GET() {
  try {
    const chartRepository = new ChartRepository();
    const result = await chartRepository.getAll();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('charts GET API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * Route API: POST /api/charts
 * Crée un nouveau chart
 * Basée sur apiPlugin.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const chartRepository = new ChartRepository();
    const result = await chartRepository.create(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('charts POST API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
}
