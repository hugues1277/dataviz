import { NextRequest, NextResponse } from "next/server";
import { testConnectionUseCase } from "@/src/api/core/useCases/testConnectionUseCase";
import { requireEditOrAdmin } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";

/**
 * POST /api/connections/test - Teste une connexion (edit ou admin)
 */
export async function POST(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    const body = await request.json();
    const result = await testConnectionUseCase.execute(body);
    return NextResponse.json({ success: result }, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "connections/test POST",
      defaultStatus: 400,
    });
  }
}
