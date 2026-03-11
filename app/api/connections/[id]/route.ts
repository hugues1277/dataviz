import { NextRequest, NextResponse } from 'next/server';
import ConnectionRepository from '../../../../src/api/repositories/connectionRepository';
import logger from '../../../../src/shared/utils/logger';
import { requireEditOrAdmin } from '../../../../src/api/utils/roleAuth';

/**
 * Route API: DELETE /api/connections/[id]
 * Supprime une connection (edit ou admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireEditOrAdmin(request.headers);
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID de la connection requis' },
        { status: 400 }
      );
    }

    const connectionRepository = new ConnectionRepository();
    await connectionRepository.delete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logger.error('connections DELETE API route', error);
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
