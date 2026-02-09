import { NextRequest, NextResponse } from 'next/server';
import ConnectionRepository from '../../../../src/api/repositories/connectionRepository';
import logger from '../../../../src/shared/utils/logger';

/**
 * Route API: DELETE /api/connections/[id]
 * Supprime une connection par son ID
 * Basée sur apiPlugin.ts
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
}
