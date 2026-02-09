import { NextRequest, NextResponse } from 'next/server';
import ConnectionRepository from '../../../src/api/repositories/connectionRepository';
import logger from '../../../src/shared/utils/logger';

/**
 * Route API: GET /api/connections
 * Récupère toutes les connections
 * Basée sur apiPlugin.ts
 */
export async function GET() {
  try {
    const connectionRepository = new ConnectionRepository();
    const result = await connectionRepository.getAll();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('connections GET API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * Route API: POST /api/connections
 * Crée une nouvelle connection
 * Basée sur apiPlugin.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const connectionRepository = new ConnectionRepository();
    await connectionRepository.create(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error: unknown) {
    logger.error('connections POST API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
}

/**
 * Route API: PUT /api/connections
 * Met à jour une connection
 * Basée sur apiPlugin.ts
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const connectionRepository = new ConnectionRepository();
    await connectionRepository.update(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error: unknown) {
    logger.error('connections PUT API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
}
