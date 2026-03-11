import { NextRequest, NextResponse } from 'next/server';
import DashboardRepository from '../../../../src/api/repositories/dashboardRepository';
import logger from '../../../../src/shared/utils/logger';
import { requireEditOrAdmin } from '../../../../src/api/utils/roleAuth';

/**
 * Route API: DELETE /api/dashboards/[id]
 * Supprime un dashboard (edit ou admin)
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
        { error: 'ID du dashboard requis' },
        { status: 400 }
      );
    }

    const dashboardRepository = new DashboardRepository();
    await dashboardRepository.delete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logger.error('dashboards DELETE API route', error);
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
