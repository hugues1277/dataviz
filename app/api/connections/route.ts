import { NextRequest, NextResponse } from 'next/server';
import ConnectionRepository from '../../../src/api/repositories/connectionRepository';
import logger from '../../../src/shared/utils/logger';
import { getAuthWithRole, requireEditOrAdmin } from '../../../src/api/utils/roleAuth';

/**
 * Route API: GET /api/connections
 * Récupère toutes les connections (auth requise)
 */
export async function GET(request: NextRequest) {
  try {
    await getAuthWithRole(request.headers);
    const connectionRepository = new ConnectionRepository();
    const result = await connectionRepository.getAll();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    logger.error('connections GET API route', error);
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Session') || msg.includes('authentifié')) {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Route API: POST /api/connections
 * Crée une nouvelle connection (edit ou admin)
 */
export async function POST(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    const body = await request.json();
    const connectionRepository = new ConnectionRepository();
    await connectionRepository.create(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error: unknown) {
    logger.error('connections POST API route', error);
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Session') || msg.includes('authentifié')) {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    if (msg.includes('lecture seule') || msg.includes('Droits')) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/**
 * Route API: PUT /api/connections
 * Met à jour une connection (edit ou admin)
 */
export async function PUT(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    const body = await request.json();
    const connectionRepository = new ConnectionRepository();
    await connectionRepository.update(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error: unknown) {
    logger.error('connections PUT API route', error);
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    if (msg.includes('Session') || msg.includes('authentifié')) {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    if (msg.includes('lecture seule') || msg.includes('Droits')) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
