import { NextRequest, NextResponse } from "next/server";
import { createFirstUserUseCase } from "@/src/api/core/useCases/createFirstUserUseCase";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";

/**
 * POST /api/admin/create-first-user - Crée le premier utilisateur admin
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et password sont requis" },
        { status: 400 }
      );
    }

    const result = await createFirstUserUseCase.execute({
      email,
      password,
      name,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "admin/create-first-user POST",
      defaultStatus: 400,
    });
  }
}
