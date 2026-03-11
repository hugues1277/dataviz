import { NextRequest, NextResponse } from "next/server";
import ConnectionRepository from "@/src/api/repositories/connectionRepository";
import { getAuthWithRole, requireEditOrAdmin } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";

/**
 * GET /api/connections - Récupère toutes les connexions (auth requise)
 */
export async function GET(request: NextRequest) {
  try {
    await getAuthWithRole(request.headers);
    const connectionRepository = new ConnectionRepository();
    const result = await connectionRepository.getAll();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "connections GET",
      defaultStatus: 500,
    });
  }
}

/**
 * POST /api/connections - Crée une nouvelle connexion (edit ou admin)
 */
export async function POST(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    const body = await request.json();
    const connectionRepository = new ConnectionRepository();
    await connectionRepository.create(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "connections POST",
      defaultStatus: 400,
    });
  }
}

/**
 * PUT /api/connections - Met à jour une connexion (edit ou admin)
 */
export async function PUT(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    const body = await request.json();
    const connectionRepository = new ConnectionRepository();
    await connectionRepository.update(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "connections PUT",
      defaultStatus: 400,
    });
  }
}
