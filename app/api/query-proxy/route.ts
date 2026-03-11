import { NextRequest, NextResponse } from "next/server";
import { queryProxyUseCase } from "@/src/api/core/useCases/queryProxyUseCase";
import { getAuthWithRole } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";

/**
 * POST /api/query-proxy - Proxy pour requêtes SQL externes (auth requise)
 */
export async function POST(request: NextRequest) {
  try {
    await getAuthWithRole(request.headers);
    const body = await request.json();
    const { connectionId, query } = body;

    if (!connectionId || !query) {
      return NextResponse.json(
        { error: "connectionId et query sont requis" },
        { status: 400 }
      );
    }

    const result = await queryProxyUseCase.execute({ connectionId, query });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "query-proxy POST",
      defaultStatus: 400,
    });
  }
}
