import { NextRequest, NextResponse } from 'next/server';
import { testConnectionUseCase } from '../../../../src/api/core/useCases/testConnectionUseCase';
import logger from '../../../../src/shared/utils/logger';

/**
 * Route API: POST /api/connections/test
 * Teste une connection
 * Basée sur apiPlugin.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await testConnectionUseCase.execute(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('connections/test POST API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
}
