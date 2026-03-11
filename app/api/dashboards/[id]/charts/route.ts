import { NextRequest, NextResponse } from 'next/server';
import ChartRepository from '../../../../../src/api/repositories/chartRepository';
import logger from '../../../../../src/shared/utils/logger';

/**
 * Route API: GET /api/dashboards/[id]/charts
 * Récupère tous les charts d'un dashboard
 */
export async function GET(
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

    const chartRepository = new ChartRepository();
    const charts = await chartRepository.getByDashboard(id);
    return NextResponse.json({ charts }, { status: 200 });
  } catch (error: unknown) {
    logger.error('dashboards charts GET API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * Route API: DELETE /api/dashboards/[id]/charts
 * Supprime tous les charts d'un dashboard
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

    const chartRepository = new ChartRepository();
    await chartRepository.deleteByDashboardId(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logger.error('dashboards charts DELETE API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
}
