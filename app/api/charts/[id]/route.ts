import { NextRequest, NextResponse } from 'next/server';
import ChartRepository from '../../../../src/api/repositories/chartRepository';
import logger from '../../../../src/shared/utils/logger';

/**
 * Route API: DELETE /api/charts/[id]
 * Supprime un chart par son ID
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
        { error: 'ID du chart requis' },
        { status: 400 }
      );
    }

    const chartRepository = new ChartRepository();
    await chartRepository.delete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logger.error('charts DELETE API route', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
}
