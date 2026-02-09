import { NextRequest, NextResponse } from 'next/server';
import { createFirstUserUseCase } from '../../../../src/api/core/useCases/createFirstUserUseCase';
import logger from '../../../../src/shared/utils/logger';

/**
 * Route API: POST /api/admin/create-first-user
 * Crée le premier utilisateur admin
 * Basée sur authApiPlugin.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et password sont requis' },
        { status: 400 }
      );
    }

    const result = await createFirstUserUseCase.execute({ email, password, name });
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('create-first-user API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
}
