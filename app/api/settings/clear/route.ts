import { NextResponse } from 'next/server';
import clearAllDatasUseCase from '../../../../src/api/core/useCases/clearAllDatasUseCase';
import logger from '../../../../src/shared/utils/logger';

/**
 * Route API: POST /api/settings/clear
 * Supprime toutes les données de l'application
 * Basée sur apiPlugin.ts
 */
export async function POST() {
  try {
    await clearAllDatasUseCase.execute();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logger.error('settings/clear POST API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
