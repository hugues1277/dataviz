import { NextResponse } from 'next/server';
import { getAppDatasUseCase } from '../../../src/api/core/useCases/getAppDatasUseCase';
import logger from '../../../src/shared/utils/logger';

/**
 * Route API: GET /api/app-datas
 * Récupère toutes les données de l'application (connections, dashboards, charts)
 * Basée sur apiPlugin.ts
 */
export async function GET() {
  try {
    const result = await getAppDatasUseCase.execute();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('app-datas API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
