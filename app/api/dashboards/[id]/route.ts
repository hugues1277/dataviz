import { NextRequest, NextResponse } from 'next/server';
import DashboardRepository from '../../../../src/api/repositories/dashboardRepository';
import logger from '../../../../src/shared/utils/logger';

/**
 * Route API: DELETE /api/dashboards/[id]
 * Supprime un dashboard par son ID
 * Basée sur apiPlugin.ts
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
}
