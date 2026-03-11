import { NextRequest, NextResponse } from 'next/server';
import ChartRepository from '../../../../src/api/repositories/chartRepository';
import logger from '../../../../src/shared/utils/logger';
import { requireEditOrAdmin } from '../../../../src/api/utils/roleAuth';

/**
 * Route API: DELETE /api/charts/[id]
 * Supprime un chart (edit ou admin)
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
        { error: 'ID du chart requis' },
        { status: 400 }
      );
    }

    const chartRepository = new ChartRepository();
    await chartRepository.delete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logger.error('charts DELETE API route', error);
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
