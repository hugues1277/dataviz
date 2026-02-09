import { NextResponse } from 'next/server';
import exportDataUseCase from '../../../src/api/core/useCases/exportDataUseCase';
import logger from '../../../src/shared/utils/logger';

/**
 * Route API: GET /api/export-app-datas
 * Exporte les données de l'application
 * Basée sur apiPlugin.ts
 */
export async function GET() {
  try {
    const result = await exportDataUseCase.execute();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('export-app-datas GET API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
