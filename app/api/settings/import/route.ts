import { NextRequest, NextResponse } from 'next/server';
import { importAppDatasUseCase } from '../../../../src/api/core/useCases/importAppDatasUseCase';
import logger from '../../../../src/shared/utils/logger';

/**
 * Route API: POST /api/settings/import
 * Importe les données de l'application
 * Basée sur apiPlugin.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await importAppDatasUseCase.execute(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error: unknown) {
    logger.error('settings/import POST API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
}
