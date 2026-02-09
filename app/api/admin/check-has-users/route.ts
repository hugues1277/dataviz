import { NextResponse } from 'next/server';
import { getUserCountUseCase } from '../../../../src/api/core/useCases/getUserCountUseCase';
import logger from '../../../../src/shared/utils/logger';

/**
 * Route API: GET /api/admin/check-has-users
 * Vérifie si des utilisateurs existent dans la base de données
 * Basée sur authApiPlugin.ts
 */
export async function GET() {
  try {
    const { hasUsers } = await getUserCountUseCase.execute();
    return NextResponse.json({ hasUsers }, { status: 200 });
  } catch (error: unknown) {
    logger.error('check-has-users API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
