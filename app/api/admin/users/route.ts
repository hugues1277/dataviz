import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/api/utils/adminAuth";
import UserRepository from "@/src/api/repositories/userRepository";
import { auth } from "@/lib/auth";
import logger from "@/src/shared/utils/logger";

/**
 * GET /api/admin/users - Liste tous les utilisateurs (admin uniquement)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);
    const userRepository = new UserRepository();
    const users = await userRepository.getAll();
    return NextResponse.json(users);
  } catch (error) {
    logger.error("GET /api/admin/users", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 403 }
    );
  }
}

/**
 * POST /api/admin/users - Crée un nouvel utilisateur (admin uniquement)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request.headers);

    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name || email.split("@")[0],
      },
    });

    if (!response?.user) {
      return NextResponse.json(
        { error: "Erreur lors de la création de l'utilisateur" },
        { status: 500 }
      );
    }

    // Définir le rôle : admin, read ou edit
    const userRole = role === "admin" ? "admin" : role === "read" ? "read" : "edit";
    const userRepository = new UserRepository();
    await userRepository.updateRole(response.user.id, userRole);

    return NextResponse.json({
      id: response.user.id,
      email: response.user.email,
      name: response.user.name,
      role: userRole,
    });
  } catch (error) {
    logger.error("POST /api/admin/users", error);
    const msg = (error as Error).message;
    if (msg.includes("forbidden") || msg.includes("autorisé")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
